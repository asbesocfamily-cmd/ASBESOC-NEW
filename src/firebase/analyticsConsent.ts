export const analyticsAvailable =
  import.meta.env.VITE_WEBSITE_ANALYTICS_ENABLED === "true";

const consentKey = "asbesoc-analytics-consent";

export function analyticsConsent() {
  try {
    return localStorage.getItem(consentKey);
  } catch {
    return "declined";
  }
}

export function setAnalyticsConsent(value: "accepted" | "declined") {
  try {
    localStorage.setItem(consentKey, value);
    if (value === "declined") {
      localStorage.removeItem("asbesoc-visitor");
      sessionStorage.removeItem("asbesoc-session");
    }
  } catch {
    // Tracking stays disabled if browser storage is unavailable.
  }
  window.dispatchEvent(new Event("asbesoc-consent"));
}
