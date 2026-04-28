// Poll external data sources for MVA signals
// Called by scheduled automation

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const NHTSA_USER_AGENT = 'MVA-Signal-Engine (support@checkmyclaim.com)';

// Inline scoring functions (can't import from lib in Deno functions)
function stripPII(payload) {
  let piiCount = 0;
  const stripped = JSON.parse(JSON.stringify(payload));
  
  function traverse(obj) {
    if (!obj || typeof obj !== 'object') return;
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string') {
        if (/[\w.-]+@[\w.-]+\.\w+/.test(value) || /\b\d{3}-\d{2}-\d{4}\b/.test(value)) {
          obj[key] = '[REDACTED]';
          piiCount++;
        }
      } else if (typeof value === 'object') {
        traverse(value);
      }
    }
  }
  traverse(stripped);
  return { stripped, piiCount };
}

function calculateSeverityScore(eventType) {
  const map = { 'vehicle_recall': 8, 'fatal_crash': 8, 'aviation_incident': 10, 'injury_crash': 5 };
  return map[eventType] || 3;
}

function calculateCompositeScore(scores, weights) {
  const weighted = (scores.severity * weights.severity + scores.volume * weights.volume + 
                   scores.wealth * weights.wealth + scores.urgency * weights.urgency +
                   (10 - scores.competition) * weights.competition) / 10;
  return Math.round(weighted * 100);
}

function getRecommendedCampaigns(eventType) {
  const map = {
    'vehicle_recall': ['product_liability_auto'],
    'fatal_crash': ['general_auto_accident', 'wrongful_death'],
    'injury_crash': ['general_personal_injury'],
  };
  return map[eventType] || ['general_personal_injury'];
}

/**
 * Main polling orchestrator — called by scheduled function
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // Admin only
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch enabled sources
    const sources = await base44.asServiceRole.entities.SignalSource.filter({ is_enabled: true });
    
    if (sources.length === 0) {
      return Response.json({ message: 'No enabled sources', polled: 0 }, { status: 200 });
    }

    let totalIngested = 0;
    const results = [];

    for (const source of sources) {
      // Skip if circuit breaker is open
      if (source.circuit_breaker_open) {
        results.push({ source: source.name, status: 'circuit_open', skipped: true });
        continue;
      }

      const runStart = new Date();
      let signalsIngested = 0;
      let signalsFailed = 0;
      let signalsPiiStripped = 0;
      let errorMessage = null;

      try {
        const rawSignals = await pollSource(source, NHTSA_USER_AGENT);
        
        for (const raw of rawSignals) {
          try {
            // Strip PII before storage
            const { stripped, piiCount } = stripPII(raw);
            signalsPiiStripped += piiCount;

            // Dedupe check
            const existing = await base44.asServiceRole.entities.RawSignal.filter({
              source_id: source.id,
              source_event_id: raw.source_event_id
            });

            if (existing.length > 0) {
              // Already ingested
              continue;
            }

            // Create RawSignal
            const rawRecord = await base44.asServiceRole.entities.RawSignal.create({
              source_id: source.id,
              source_event_id: raw.source_event_id,
              event_type: raw.event_type,
              event_subtype: raw.event_subtype || '',
              severity_raw: raw.severity_raw || '',
              location_geojson: raw.location_geojson || null,
              affected_states: raw.affected_states || [],
              affected_counties: raw.affected_counties || [],
              affected_zip_codes: raw.affected_zip_codes || [],
              event_started_at: raw.event_started_at,
              event_ended_at: raw.event_ended_at || null,
              title: raw.title,
              description: raw.description,
              source_url: raw.source_url || '',
              raw_payload_stripped: stripped,
              ingested_at: new Date().toISOString(),
            });

            // Score the signal
            const settings = await base44.asServiceRole.entities.SignalEngineSettings.list();
            const weights = settings[0]?.scoring_weights || {
              severity: 0.30,
              volume: 0.20,
              wealth: 0.20,
              urgency: 0.20,
              competition: 0.10,
            };

            const severityScore = calculateSeverityScore(raw.event_type, raw.metadata);
            const volumeScore = 5; // Simplified for this build
            const wealthScore = 5; // Would fetch from ZipCodeData
            const urgencyScore = 6; // Simplified
            const competitionScore = 5; // Simplified

            const compositeScore = calculateCompositeScore(
              { severity: severityScore, volume: volumeScore, wealth: wealthScore, urgency: urgencyScore, competition: competitionScore },
              weights
            );

            const campaigns = getRecommendedCampaigns(raw.event_type);

            // Create ScoredSignal
            const scored = await base44.asServiceRole.entities.ScoredSignal.create({
              raw_signal_id: rawRecord.id,
              severity_score: severityScore,
              volume_score: volumeScore,
              wealth_score: wealthScore,
              urgency_score: urgencyScore,
              competition_score: competitionScore,
              composite_score: compositeScore,
              recommended_campaigns: campaigns,
              recommended_geo_targeting: raw.affected_zip_codes || [],
              recommended_demographic_targeting: {
                age_range: '18-65',
                vehicle_ownership: 'high',
              },
              recommended_creative_angles: generateAngles(raw.event_type),
              recommended_buyer_types: [],
              recommended_daily_budget_low: 1000,
              recommended_daily_budget_high: 5000,
              brief_summary: raw.title,
              status: 'new',
            });

            // Check alert thresholds and fire alerts if needed
            if (compositeScore >= (settings[0]?.alert_threshold_composite_score || 60)) {
              await fireAlert(base44, scored, settings[0], compositeScore);
            }

            signalsIngested++;
          } catch (itemErr) {
            signalsFailed++;
          }
        }

        // Update source success metrics
        await base44.asServiceRole.entities.SignalSource.update(source.id, {
          last_polled_at: new Date().toISOString(),
          last_success_at: new Date().toISOString(),
          consecutive_failures: 0,
          circuit_breaker_open: false,
        });

        results.push({
          source: source.name,
          status: 'success',
          ingested: signalsIngested,
          pii_stripped: signalsPiiStripped,
        });

      } catch (err) {
        errorMessage = err.message;
        const newFailures = (source.consecutive_failures || 0) + 1;
        const circuitOpen = newFailures >= 5;

        await base44.asServiceRole.entities.SignalSource.update(source.id, {
          last_polled_at: new Date().toISOString(),
          last_error_at: new Date().toISOString(),
          last_error_message: errorMessage,
          consecutive_failures: newFailures,
          circuit_breaker_open: circuitOpen,
        });

        results.push({
          source: source.name,
          status: 'error',
          error: errorMessage,
          circuit_breaker_open: circuitOpen,
        });
      }

      // Log run
      if (signalsIngested > 0 || signalsFailed > 0) {
        await base44.asServiceRole.entities.SignalRunLog.create({
          source_id: source.id,
          run_started_at: runStart.toISOString(),
          run_finished_at: new Date().toISOString(),
          signals_ingested: signalsIngested,
          signals_skipped_duplicate: 0,
          signals_failed: signalsFailed,
          signals_pii_stripped: signalsPiiStripped,
          error_summary: errorMessage || '',
        });
      }

      totalIngested += signalsIngested;
    }

    return Response.json({
      status: 'success',
      message: `Polled ${sources.length} sources, ingested ${totalIngested} signals`,
      results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

/**
 * Poll individual source — returns array of raw signals
 */
async function pollSource(source, userAgent) {
  // Simplified adapters — in production, each source type has specialized parsing
  
  switch (source.source_type) {
    case 'nhtsa_recall':
      return await pollNHTSARecall(userAgent);
    case 'nhtsa_fars':
      return await pollNHTSAFARS(userAgent);
    case 'google_news':
      return await pollGoogleNews(userAgent);
    default:
      return [];
  }
}

async function pollNHTSARecall(userAgent) {
  const res = await fetch('https://api.nhtsa.gov/recalls/recallsByVehicle', {
    headers: { 'User-Agent': userAgent }
  });
  
  if (!res.ok) throw new Error(`NHTSA API returned ${res.status}`);
  
  const data = await res.json();
  const signals = [];
  
  // Parse recalls into signals (simplified)
  for (const recall of data.results || []) {
    if (recall.NumberOfVehiclesAffected < 50000) continue; // Filter by volume
    
    signals.push({
      source_event_id: recall.RecallID,
      event_type: 'vehicle_recall',
      event_subtype: recall.Component,
      severity_raw: 'safety_issue',
      affected_states: ['US'], // Would parse to specific states if available
      affected_zip_codes: [],
      event_started_at: recall.RecallDate,
      title: `${recall.Manufacturer} ${recall.ModelYear} ${recall.Model} recall - ${recall.Summary}`,
      description: `Vehicle recall: ${recall.Summary}. ${recall.NumberOfVehiclesAffected.toLocaleString()} vehicles affected.`,
      source_url: `https://www.nhtsa.gov/recalls`,
      metadata: {
        affected_vehicles: recall.NumberOfVehiclesAffected,
        severity_level: 'serious'
      }
    });
  }
  
  return signals;
}

async function pollNHTSAFARS(userAgent) {
  // FARS is lagging (monthly updates), simplified placeholder
  return [];
}

async function pollGoogleNews(userAgent) {
  // Google News API call would go here
  return [];
}

async function fireAlert(base44, signal, settings, score) {
  const isUrgent = score >= (settings?.urgent_threshold_composite_score || 80);
  
  if (isUrgent && settings?.sms_alert_recipients?.length > 0) {
    for (const phone of settings.sms_alert_recipients) {
      await base44.asServiceRole.entities.SignalAlert.create({
        scored_signal_id: signal.id,
        alert_type: 'sms',
        recipient: phone,
        sent_at: new Date().toISOString(),
        delivery_status: 'pending',
        payload_summary: `URGENT: ${signal.brief_summary} (Score: ${Math.round(score)})`,
      });
    }
  }

  if (settings?.alert_recipients?.length > 0) {
    for (const email of settings.alert_recipients) {
      await base44.asServiceRole.entities.SignalAlert.create({
        scored_signal_id: signal.id,
        alert_type: 'email',
        recipient: email,
        sent_at: new Date().toISOString(),
        delivery_status: 'pending',
        payload_summary: `Signal: ${signal.brief_summary} (Score: ${Math.round(score)})`,
      });
    }
  }
}

function generateAngles(eventType) {
  const angles = {
    'vehicle_recall': [
      'Was your vehicle recalled? You may have a case.',
      'Defective vehicle caused injury?',
      'Vehicle recall claim',
    ],
    'fatal_crash': [
      'Injured in a fatal crash? Free consultation.',
      'Lost a loved one?',
      'Fatal accident victim?',
    ],
  };
  
  return angles[eventType] || ['Personal injury? Free legal help.'];
}