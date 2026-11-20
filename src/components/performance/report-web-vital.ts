import type { useReportWebVitals } from "next/web-vitals";

type WebVitalMetric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0];

const TRACKED_METRICS = new Set(["TTFB", "FCP", "LCP", "CLS", "INP"]);
const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** Keeps query strings and record ids out of the collected metric. */
function sanitizeNavigationURL(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, "http://localhost").pathname.replace(
      UUID_PATTERN,
      ":id",
    );
  } catch {
    return undefined;
  }
}

/**
 * Reports Core Web Vitals without blocking the page.
 *
 * Development logs to the console; production sends a best-effort beacon to
 * `NEXT_PUBLIC_WEB_VITALS_ENDPOINT` when configured. Observability must never
 * break the application, so transport errors are swallowed.
 */
export function reportWebVital(metric: WebVitalMetric): void {
  if (!TRACKED_METRICS.has(metric.name)) {
    return;
  }

  const payload = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    navigationType: metric.navigationType,
    navigationURL: sanitizeNavigationURL(metric.navigationURL),
  };

  if (process.env.NODE_ENV !== "production") {
    console.info("[web-vitals]", payload);
    return;
  }

  const endpoint = process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT;

  if (
    !endpoint ||
    typeof navigator === "undefined" ||
    typeof navigator.sendBeacon !== "function"
  ) {
    return;
  }

  try {
    // A string uses text/plain;charset=UTF-8, a CORS-safelisted content type,
    // so cross-origin collectors do not need to answer a preflight request.
    navigator.sendBeacon(endpoint, JSON.stringify(payload));
  } catch {
    // Intentionally silent: metrics are non-critical.
  }
}
