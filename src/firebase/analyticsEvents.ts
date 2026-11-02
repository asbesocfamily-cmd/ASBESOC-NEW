import { analyticsAvailable, analyticsConsent } from "./analyticsConsent";

type WebsiteEvent = "page" | "heartbeat" | "signup" | "application";

export async function trackWebsiteEvent(
  kind: WebsiteEvent,
  page = window.location.pathname,
  previous = "",
) {
  if (
    !analyticsAvailable ||
    analyticsConsent() !== "accepted" ||
    navigator.doNotTrack === "1" ||
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl ||
    page.startsWith("/admin")
  ) {
    return;
  }

  try {
    const { trackWebsiteEvent: recordEvent } = await import("./analytics");
    await recordEvent(kind, page, previous);
  } catch {
    // Analytics loading must never interrupt a visitor's task.
  }
}
