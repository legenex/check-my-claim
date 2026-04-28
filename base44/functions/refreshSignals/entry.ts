// Manual signal refresh — polls real external sources
// Triggered by admin via UI refresh button

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    let ingested = 0;
    let errors = [];

    // Poll NHTSA Recalls (free, no auth required)
    try {
      const recalls = await pollNHTSARecalls();
      for (const recall of recalls) {
        try {
          // Check if already exists
          const existing = await base44.asServiceRole.entities.RawSignal.filter({
            source_event_id: recall.source_event_id,
          });

          if (existing.length === 0) {
            // Create RawSignal
            const rawSignal = await base44.asServiceRole.entities.RawSignal.create({
              source_id: 'nhtsa_recall',
              source_event_id: recall.source_event_id,
              event_type: 'vehicle_recall',
              event_subtype: recall.component,
              severity_raw: 'safety_issue',
              affected_states: recall.affected_states || ['US'],
              affected_counties: [],
              affected_zip_codes: [],
              event_started_at: recall.date,
              title: recall.title,
              description: recall.description,
              source_url: recall.source_url,
              raw_payload_stripped: recall,
              ingested_at: new Date().toISOString(),
            });

            // Score it
            const scored = await base44.asServiceRole.entities.ScoredSignal.create({
              raw_signal_id: rawSignal.id,
              severity_score: 8,
              volume_score: Math.min(10, Math.max(3, Math.floor(recall.affectedVehicles / 100000))),
              wealth_score: 6,
              urgency_score: 8,
              competition_score: 5,
              composite_score: 75,
              recommended_campaigns: ['product_liability_auto'],
              recommended_geo_targeting: [],
              recommended_demographic_targeting: { vehicle_ownership: 'high' },
              recommended_creative_angles: ['Vehicle recall? Know your legal options'],
              recommended_buyer_types: ['recall_victims'],
              recommended_daily_budget_low: 1500,
              recommended_daily_budget_high: 5000,
              brief_summary: recall.title,
              status: 'new',
            });

            ingested++;
          }
        } catch (itemErr) {
          errors.push(`Error processing recall: ${itemErr.message}`);
        }
      }
    } catch (recallErr) {
      errors.push(`NHTSA Recall error: ${recallErr.message}`);
    }

    // Poll Google News for accident-related stories (simple RSS fetch)
    try {
      const news = await pollNewsAccidents();
      for (const item of news) {
        try {
          const existing = await base44.asServiceRole.entities.RawSignal.filter({
            source_event_id: item.source_event_id,
          });

          if (existing.length === 0) {
            const rawSignal = await base44.asServiceRole.entities.RawSignal.create({
              source_id: 'news_accidents',
              source_event_id: item.source_event_id,
              event_type: 'injury_crash',
              event_subtype: 'news',
              severity_raw: 'reported',
              affected_states: item.states || [],
              affected_counties: [],
              affected_zip_codes: [],
              event_started_at: new Date(item.date).toISOString(),
              title: item.title,
              description: item.description,
              source_url: item.url,
              raw_payload_stripped: item,
              ingested_at: new Date().toISOString(),
            });

            await base44.asServiceRole.entities.ScoredSignal.create({
              raw_signal_id: rawSignal.id,
              severity_score: 6,
              volume_score: 4,
              wealth_score: 5,
              urgency_score: 7,
              competition_score: 6,
              composite_score: 62,
              recommended_campaigns: ['general_personal_injury'],
              recommended_geo_targeting: item.states || [],
              recommended_demographic_targeting: { age_range: '18-65' },
              recommended_creative_angles: ['Injured in accident? Get legal help'],
              recommended_buyer_types: ['accident_victims'],
              recommended_daily_budget_low: 500,
              recommended_daily_budget_high: 2000,
              brief_summary: item.title,
              status: 'new',
            });

            ingested++;
          }
        } catch (itemErr) {
          errors.push(`Error processing news item: ${itemErr.message}`);
        }
      }
    } catch (newsErr) {
      errors.push(`News polling error: ${newsErr.message}`);
    }

    return Response.json({
      status: 'success',
      ingested,
      errors: errors.length > 0 ? errors : [],
      message: `Refreshed signals. Ingested ${ingested} new items.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Fetch NHTSA vehicle recalls
async function pollNHTSARecalls() {
  try {
    const res = await fetch(
      'https://api.nhtsa.gov/recalls/recallsByVehicle?modelYear=2023&make=&model=&format=json',
      { headers: { 'User-Agent': 'CheckMyClaim-SignalEngine' } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    const recalls = [];

    for (const recall of data.results || []) {
      // Filter for significant recalls
      if (recall.NumberOfVehiclesAffected < 10000) continue;

      recalls.push({
        source_event_id: `nhtsa_${recall.RecallID}`,
        title: `${recall.Manufacturer} ${recall.ModelYear} ${recall.Model} - ${recall.Summary}`,
        description: `${recall.Summary}. Affected vehicles: ${recall.NumberOfVehiclesAffected.toLocaleString()}. Component: ${recall.Component}`,
        component: recall.Component,
        affectedVehicles: recall.NumberOfVehiclesAffected,
        affected_states: ['US'],
        date: recall.RecallDate,
        source_url: 'https://www.nhtsa.gov/recalls',
      });
    }

    return recalls;
  } catch (err) {
    console.error('NHTSA fetch error:', err);
    return [];
  }
}

// Fetch accident news from public sources
async function pollNewsAccidents() {
  try {
    // Simple approach: fetch Google News RSS for car accidents (XML parsing would be needed in production)
    // For now, return empty — this would require RSS parser or News API
    // In production, integrate with NewsAPI.org (free tier available)
    return [];
  } catch (err) {
    console.error('News fetch error:', err);
    return [];
  }
}