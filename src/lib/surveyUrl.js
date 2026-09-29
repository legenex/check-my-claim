/**
 * Survey URL utility — shared across all pages.
 * Captures incoming UTM/tracking params into sessionStorage on first call,
 * then builds outbound qualify.checkmyclaim.co URLs with correct params.
 */

const SURVEY_BASE = "https://qualify.checkmyclaim.co/s/mva";

/** Call once on page load (or lazily) to capture incoming params. */
export function captureIncomingParams() {
  const params = new URLSearchParams(window.location.search);
  const keys = ["sid", "fbclid", "gclid", "ttclid",
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  keys.forEach(k => {
    const v = params.get(k);
    if (v) sessionStorage.setItem(`cmc_${k}`, v);
  });
}

/**
 * Build a survey URL.
 * @param {object} opts
 * @param {string} opts.linkId       - e.g. "link_1", "phone_header", "link_cta_section"
 * @param {string} [opts.utmMedium]  - advertorial utm_medium_label (e.g. "rideshare"). Fallback to sessionStorage.
 * @param {string} [opts.utmCampaign]- override campaign. Defaults to "Advertorial".
 * @param {string} [opts.baseUrl]    - override base URL (advertorial.primary_cta_url)
 */
export function buildSurveyUrl({ linkId = "link_cta", utmMedium, utmCampaign, baseUrl, extraParams } = {}) {
  const base = baseUrl || SURVEY_BASE;

  // Prefer sessionStorage values captured from incoming traffic
  const stored = (key) => sessionStorage.getItem(`cmc_${key}`) || "";

  const sid = stored("sid") || "LGNX";
  const source = stored("utm_source") || "CMC-Site";
  const medium = stored("utm_medium") || utmMedium || "advertorial";
  // Default campaign: "Experiment" if utmCampaign says so, else "Advertorial"
  const campaign = stored("utm_campaign") || utmCampaign || "Advertorial";
  const fbclid = stored("fbclid");
  const gclid = stored("gclid");
  const ttclid = stored("ttclid");

  const p = new URLSearchParams();
  p.set("sid", sid);
  p.set("utm_source", source);
  p.set("utm_medium", medium);
  p.set("utm_campaign", campaign);
  p.set("utm_content", linkId);
  if (fbclid) p.set("fbclid", fbclid);
  if (gclid) p.set("gclid", gclid);
  if (ttclid) p.set("ttclid", ttclid);
  if (extraParams) Object.entries(extraParams).forEach(([k, v]) => { if (v) p.set(k, v); });

  return `${base}?${p.toString()}`;
}

/**
 * Increment the clicks counter on an Advertorial record.
 * Fire-and-forget — does not block navigation.
 */
export async function incrementAdvClicks(advertorial, base44) {
  if (!advertorial?.id) return;
  try {
    await base44.entities.Advertorial.update(advertorial.id, {
      clicks: (advertorial.clicks || 0) + 1,
    });
  } catch (_) {}
}

/**
 * Increment clicks on an Experiment record.
 */
export async function incrementExpClicks(experiment, base44) {
  if (!experiment?.id) return;
  try {
    await base44.entities.Experiment.update(experiment.id, {
      clicks: (experiment.clicks || 0) + 1,
    });
  } catch (_) {}
}

/**
 * Debounced view count for an Experiment record (once per session per slug).
 */
export function incrementExpViews(experiment, base44) {
  if (!experiment?.id) return;
  const key = `cmc_exp_viewed_${experiment.slug}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  try {
    base44.entities.Experiment.update(experiment.id, {
      view_count: (experiment.view_count || 0) + 1,
    }).catch(() => {});
  } catch (_) {}
}

/**
 * Debounced view count increment — only fires once per session per slug.
 */
export function incrementAdvViews(advertorial, base44) {
  if (!advertorial?.id) return;
  const key = `cmc_viewed_${advertorial.slug}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  try {
    base44.entities.Advertorial.update(advertorial.id, {
      view_count: (advertorial.view_count || 0) + 1,
    }).catch(() => {});
  } catch (_) {}
}