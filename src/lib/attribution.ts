export const ATTRIBUTION_KEY = "ch-kaynak";
export const ATTRIBUTION_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"] as const;

export type Attribution = Partial<Record<(typeof ATTRIBUTION_FIELDS)[number] | "referrer", string>>;

export function readAttribution(): Attribution {
  try {
    return JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) || "{}") || {};
  } catch {
    return {};
  }
}
