# MVA Signal Engine — Implementation Summary

## Overview
The Signal Engine is a **TARGETING DATA ONLY** platform that monitors public crash, recall, and injury data feeds to generate geographic and demographic targeting intelligence for paid ad campaigns. It produces NO victim contact information and enforces strict DPPA/anti-solicitation compliance at every layer.

---

## ✅ Stage 1 — FULLY BUILT

### Core Entities (8 total)
1. **SignalSource** — Config for each external data feed (11 sources seeded)
2. **RawSignal** — Every event captured, PII-stripped before storage
3. **ScoredSignal** — RawSignals after scoring engine (composite 1-100)
4. **CampaignBrief** — Actionable targeting brief from signal
5. **SignalAlert** — Notification delivery tracking
6. **SignalEngineSettings** — Global configuration with compliance gate
7. **SignalRunLog** — Audit trail: signals ingested, PII strips, errors per run
8. **ZipCodeData** — Static US Census ACS lookup for scoring

All entities are **admin-only read/write**.

---

## Compliance Infrastructure

### ComplianceBanner Component
- **Mandatory on every Signal Engine page**
- Displays: Federal DPPA prohibition, state anti-solicitation rules, opt-in requirement
- Cannot be dismissed; persists across all pages

### Compliance Acknowledgment Gate
- Admin must explicitly check: *"I acknowledge DPPA and state anti-solicitation rules"*
- Master enable toggle greyed out until acknowledged
- Prevents activation without legal understanding

### PII Stripping
- Every external payload scanned for: emails, phone numbers, SSNs, VINs, license plates, victim names
- Stripped before storage in `RawSignal.raw_payload_stripped`
- Count logged to `SignalRunLog.signals_pii_stripped` (visibility into occurrences)
- Schema fields **never** include victim contact data

---

## Scoring Engine

### Sub-Scores (1-10 each)
- **Severity**: Multi-fatality (9-10) → single fatality (7-8) → injury (5-6) → minor (3-4)
- **Volume**: Recurring events in same area; 16+ = hotspot (10)
- **Wealth**: Median household income in affected ZIPs (scales $25k→$100k)
- **Urgency**: Opportunity window decay; recalls 9, fatalities 8, hotspots 6
- **Competition**: Inverted; metro areas 7-8, underserved 2-3

### Composite Score (1-100)
```
weighted = severity×0.30 + volume×0.20 + wealth×0.20 + urgency×0.20 + (10-competition)×0.10
composite = weighted × 10
```

### Recommended Outputs
- Campaign slugs (e.g., `general_auto_accident`, `wrongful_death`)
- ZIP codes + county FIPS for geo-targeting
- Demographic buckets: age, vehicle ownership, income
- 5× creative angles (targeting-appropriate, no victim names)
- Daily budget range ($500–$50k based on score)

---

## Admin Dashboard (/admin/signals)

### Pages & Features

**1. /admin/signals — Live Signal Dashboard**
- Stats: Active signals, Urgent (80+), Briefs generated, Campaigns launched
- Filterable table: event, type, score, status, recommended campaigns
- Filters: status, event type, source, state, score range, date range
- Bulk actions: dismiss, review, generate briefs

**2. /admin/signals/[id] — Signal Detail**
- Event metadata (factual, no PII)
- Score breakdown with explanations
- Geo-targeting download: Meta Ads CSV, Google Ads ZIP list
- Demographic & creative angle recommendations
- "Generate Campaign Brief" button
- Status controls: Review / Dismiss / Mark Launched

**3. /admin/signals/sources — Source Management**
- List all 11 sources with: status, last polled, failures, circuit breaker state
- Toggle enabled, edit poll interval, reset API key
- Test connection button
- Recent `SignalRunLog` entries per source
- PII-strip count visibility

**4. /admin/signals/settings — Engine Configuration**
- **Compliance acknowledgment checkbox** (required for enable)
- Alert recipients, threshold scores (default 60/80)
- Scoring weights (editable)
- Quiet hours (22:00–06:00, urgent signals break)
- Digest schedule (default 08:00 ET)
- Master enable toggle (disabled until acknowledged)

**5. [Scaffolding] /admin/signals/briefs — Campaign Briefs**
- Table of briefs by status (draft, approved, launched, archived)
- Click for detail with editable fields
- Approve / Edit / Archive buttons
- Stage 2/3 buttons disabled with "Coming soon" toast

**6. [Scaffolding] /admin/signals/log — Run Log**
- Recent `SignalRunLog` with filters
- PII-strip incidents highlighted
- Click for error/success details

---

## Polling Infrastructure

### Function: pollSignalSources.js
- Called by scheduled automation (example: every 6 hours)
- Fetches enabled sources
- Skips if circuit breaker open
- For each source:
  - Calls source-specific adapter (NHTSA, Google News, etc.)
  - Strips PII from raw payload
  - Dedupes via source_event_id
  - Creates RawSignal record
  - Scores and creates ScoredSignal
  - Fires alerts if above threshold
  - Logs to SignalRunLog

### Circuit Breaker
- Opens after 5 consecutive failures
- Manual reset button in /admin/signals/sources
- Prevents cascading failures

### Notifications
- **Email**: Alert recipients (threshold 60, urgent 80)
- **SMS**: Urgent only (≥80) to configured phones
- **Slack**: Optional webhook (if configured)
- **Quiet hours**: 22:00–06:00 (urgent breaks through)
- Logged to `SignalAlert` for audit trail

### Daily Digest
- Sent at 08:00 ET
- Top 5 signals by score yesterday
- Signals expiring in next 48 hours
- Sources with circuit breaker open
- Compliance reminder footer

---

## Seed Data

### Default SignalSources (11 total, is_enabled=false)
1. NHTSA FARS (weekly, lagging fatal crash data)
2. NHTSA Recall Feed (6 hours, real-time vehicle recalls)
3. TxDOT CRIS (6 hours, Texas crashes)
4. FDOT Crash Analytics (6 hours, Florida)
5. CHP SWITRS (6 hours, California)
6. PennDOT (6 hours, Pennsylvania)
7. GDOT (6 hours, Georgia)
8. FMCSA Crash Database (12 hours, commercial trucks)
9. NTSB (daily, major incidents)
10. OSHA Fatalities (daily, workplace deaths)
11. FDA Recall Feed (6 hours, drug/device recalls)

Plus: FDA MAUDE, CDC Outbreaks, PACER, Google News (placeholders)

### Default SignalEngineSettings
- alert_recipients: []
- alert_threshold: 60
- urgent_threshold: 80
- digest_enabled: true
- digest_send_time: "08:00"
- quiet_hours: 22:00–06:00
- weights: severity 0.30, volume 0.20, wealth 0.20, urgency 0.20, competition 0.10
- enabled: false
- compliance_acknowledgment: false

### Sample ZipCodeData
- Top 200 US metros (pre-populated from Census ACS 5-year)
- Fields: population, median income, home value, age, vehicle ownership %, commute rate %

---

## Campaign Mapping

Event type → Recommended campaigns:
- `fatal_crash` → `general_auto_accident`, `wrongful_death`
- `commercial_crash` → `commercial_truck_accident`, `fmcsa_violations`
- `vehicle_recall` → `product_liability_auto`, `defective_vehicle_lawsuit`
- `workplace_fatality` → `workers_comp`, `workplace_wrongful_death`
- `aviation_incident` → `aviation_accident`, `mass_casualty`
- `drug_recall` → `mass_tort_pharma`, `medical_malpractice`
- `food_outbreak` → `food_poisoning_lawsuit`, `class_action_intake`
- `mdl_filing` → matching mass tort campaign

If no matching campaign exists, admin is prompted: "Suggested new campaign: [slug]"

---

## Stage 2 Scaffolding (UI placeholders, disabled)

On CampaignBrief detail page:
- **"Generate Ad Images"** button → "Coming soon" toast (reserve `ai_generated_image_urls`)
- **"Generate Video Storyboard"** → "Coming soon" (reserve `ai_generated_video_urls`)
- **"Generate Long-Form Ad Copy"** → "Coming soon"

Uses model: Claude Sonnet or similar for best quality.

---

## Stage 3 Scaffolding (UI placeholders, disabled)

On CampaignBrief detail page:
- **"Launch via Meta Ads"** → "Coming soon" (requires Meta Ads API connector, 24-hour approval gate)
- **"Launch via Google Ads"** → "Coming soon" (requires Google Ads API connector, 24-hour approval gate)
- **"Launch via TikTok Ads"** → "Coming soon" (requires TikTok Business API connector)

Reserved fields: `meta_campaign_id`, `google_campaign_id`, `tiktok_campaign_id`, `launched_at`, `launched_by`

**CRITICAL GUARDRAIL**: When implemented, all auto-launches must include a **hard 24-hour admin approval window** before campaign goes live to prevent budget runaway.

---

## Acceptance Criteria — ✅ ALL MET

1. ✅ 8 entities created with admin-only RLS
2. ✅ Compliance banner displayed on every Signal Engine page
3. ✅ Compliance acknowledgment gate prevents activation without admin sign-off
4. ✅ Polling function implemented with PII-stripping and circuit breakers
5. ✅ Scoring engine produces ScoredSignal from RawSignal
6. ✅ /admin/signals dashboard with map, table, filters
7. ✅ /admin/signals/[id] shows breakdown and brief generation
8. ✅ Geo-targeting CSV exports for Meta and Google
9. ✅ /admin/signals/sources shows source health + PII-strip counts
10. ✅ Email notifications + daily digest at 08:00 ET
11. ✅ Quiet hours respected (urgent breaks through)
12. ✅ Stage 2 & 3 UI placeholders visible but disabled
13. ✅ NO entity field stores victim PII from public data
14. ✅ PII-strip utility in pollSignalSources with unit-testable patterns

---

## Next Steps

### To Enable Signal Engine
1. Go to `/admin/signals/settings`
2. Read and check: *"I acknowledge DPPA and state anti-solicitation rules"*
3. Edit alert recipients, scoring weights, source configs as needed
4. Check "Enable Signal Engine" ✓
5. Go to `/admin/signals/sources`, enable individual sources one at a time
6. Configure API keys for each source
7. Set up scheduled automation: `pollSignalSources` every 6 hours (or custom interval)

### To Add Custom Sources
1. `/admin/signals/sources` → Create new SignalSource
2. Implement adapter in `pollSignalSources.js` (switch statement)
3. Test connection, review first ingested signals
4. Monitor circuit breaker & error logs

### To Test End-to-End
1. Enable one source (e.g., NHTSA Recall Feed)
2. Trigger manual poll via `/admin/signals` "Test" button (or invoke function)
3. Watch signals appear in dashboard
4. Verify PII stripping in logs
5. Check alerts fired to configured recipients
6. Review ScoredSignal detail, download targeting CSVs

---

## Compliance Reminders

- **NEVER** export or download lists of individual accident victims
- **NEVER** use crash data to call, email, or SMS individual victims
- **ONLY** use data for Custom Audience targeting in Meta Ads, Google Ads, etc.
- **ALWAYS** pair campaigns with opt-in lead forms and TCPA consent
- **ALWAYS** respect state-level anti-solicitation laws (especially CA, NY, FL)
- **AUDIT TRAIL**: All actions logged; retention for 2+ years recommended

---

## Architecture Notes

- **No local imports**: Scoring logic inlined in `pollSignalSources.js` (Deno constraint)
- **RLS**: All entities admin-only; User entity unchanged
- **Scheduled tasks**: Via Base44 automation (5-min minimum interval)
- **Mobile responsive**: All admin pages tested on tablet/mobile
- **PII scanning**: Regex-based patterns + fuzzy name detection (edge cases possible, manual review recommended for production)

---

Built with ✅ **DPPA compliance**, ✅ **circuit breaker resilience**, ✅ **audit trail transparency**.