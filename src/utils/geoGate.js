/**
 * TrustedForm Geo-Gate — synchronous, zero network requests.
 * Returns true if TrustedForm script injection should be SKIPPED.
 * Evaluated in order; first match wins.
 */
export function shouldSkipTrustedForm() {
  // 1. Manual localStorage override
  try {
    if (localStorage.getItem("cmc_disable_trustedform") === "1") return true;
  } catch (_) {}

  // 2. URL query param override
  try {
    if (new URLSearchParams(window.location.search).get("cmc_no_tf") === "1") return true;
  } catch (_) {}

  // 3. South African timezone signals (synchronous — no network)
  const SA_TIMEZONES = new Set([
    "Africa/Johannesburg",
    "Africa/Cape_Town",
    "Africa/Maseru",
    "Africa/Mbabane",
    "Africa/Windhoek",
  ]);
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (SA_TIMEZONES.has(tz)) return true;
  } catch (_) {}

  // 4. South African language signals
  const SA_LANG_RE = /^(af|zu|xh|st|tn|ts|ss|nr|nd|ve)/i;
  try {
    const langs = [
      navigator.language,
      ...(navigator.languages || []),
    ].filter(Boolean);
    if (langs.some((l) => SA_LANG_RE.test(l))) return true;
  } catch (_) {}

  return false;
}