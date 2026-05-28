/**
 * Advertorial URL utility.
 * Separate from surveyUrl.js so we never break existing quiz/experiment routing.
 * QUIZ_BASE is the single source of truth for the advertorial quiz destination.
 */

export const QUIZ_BASE = "https://qualify.checkmyclaim.co/s/mva";

const CAPTURE_KEYS = ["sid", "fbclid", "gclid", "ttclid", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ad_label"];
const STORE_KEY = "cmc_attribution";

/** Call once on /a/{slug} page load to snapshot incoming params. */
export function captureAdvParams() {
  const params = new URLSearchParams(window.location.search);
  const stored = {};
  CAPTURE_KEYS.forEach(k => {
    const v = params.get(k);
    if (v) stored[k] = v;
  });
  if (Object.keys(stored).length > 0) {
    try {
      const existing = JSON.parse(sessionStorage.getItem(STORE_KEY) || "{}");
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ ...existing, ...stored }));
    } catch (_) {}
  }
}

function getStored() {
  try { return JSON.parse(sessionStorage.getItem(STORE_KEY) || "{}"); } catch (_) { return {}; }
}

/**
 * Build a CTA URL for an advertorial record.
 * Incoming params (captured via captureAdvParams) override defaults.
 *
 * Default scheme:
 *   sid=LEADFLOW, utm_source=Taboola, utm_medium=Advertorial,
 *   utm_campaign={slug}, utm_content={linkId}, ad_label={record.ad_label}
 */
export function buildAdvUrl({ slug, adLabel, linkId = "link_1" }) {
  const stored = getStored();

  const p = new URLSearchParams();
  p.set("sid", stored.sid || "LEADFLOW");
  p.set("utm_source", stored.utm_source || "Taboola");
  p.set("utm_medium", stored.utm_medium || "Advertorial");
  p.set("utm_campaign", stored.utm_campaign || slug || "advertorial");
  p.set("utm_content", stored.utm_content || linkId);
  if (stored.ad_label || adLabel) p.set("ad_label", stored.ad_label || adLabel);
  if (stored.fbclid) p.set("fbclid", stored.fbclid);
  if (stored.gclid) p.set("gclid", stored.gclid);
  if (stored.ttclid) p.set("ttclid", stored.ttclid);

  return `${QUIZ_BASE}?${p.toString()}`;
}

/** Fire-and-forget click counter. */
export async function incrementAdvClicks(advertorial, base44Client) {
  if (!advertorial?.id) return;
  try {
    await base44Client.entities.Advertorial.update(advertorial.id, {
      clicks: (advertorial.clicks || 0) + 1,
    });
  } catch (_) {}
}

/** Debounced view count, once per session per slug. */
export function incrementAdvViews(advertorial, base44Client) {
  if (!advertorial?.id) return;
  const key = `cmc_adv_viewed_${advertorial.slug}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  try {
    base44Client.entities.Advertorial.update(advertorial.id, {
      view_count: (advertorial.view_count || 0) + 1,
    }).catch(() => {});
  } catch (_) {}
}