import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { reportWebVital } from "./report-web-vital";

const sendBeacon = vi.fn();
const conversationId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

type Metric = Parameters<typeof reportWebVital>[0];

function metric(overrides: Partial<Metric> = {}): Metric {
  return {
    id: "metric-1",
    name: "LCP",
    value: 1800,
    rating: "good",
    navigationType: "navigate",
    navigationURL: `https://example.com/products/${conversationId}?ref=home#top`,
    ...overrides,
  } as Metric;
}

describe("reportWebVital", () => {
  let consoleInfo: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      writable: true,
      value: sendBeacon,
    });
  });

  afterEach(() => {
    consoleInfo.mockRestore();
    vi.unstubAllEnvs();
  });

  it("logs a sanitized metric in development", () => {
    vi.stubEnv("NODE_ENV", "development");

    reportWebVital(metric());

    expect(consoleInfo).toHaveBeenCalledWith("[web-vitals]", {
      name: "LCP",
      value: 1800,
      rating: "good",
      navigationType: "navigate",
      navigationURL: "/products/:id",
    });
    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it("sends a beacon to the configured endpoint in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_WEB_VITALS_ENDPOINT", "https://collector.test/vitals");

    reportWebVital(metric({ name: "INP", value: 120 }));

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [endpoint, body] = sendBeacon.mock.calls[0] as [string, string];
    expect(endpoint).toBe("https://collector.test/vitals");
    expect(body).toBe(
      JSON.stringify({
        name: "INP",
        value: 120,
        rating: "good",
        navigationType: "navigate",
        navigationURL: "/products/:id",
      }),
    );
    expect(consoleInfo).not.toHaveBeenCalled();
  });

  it("stays silent in production without an endpoint", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_WEB_VITALS_ENDPOINT", "");

    reportWebVital(metric());

    expect(sendBeacon).not.toHaveBeenCalled();
    expect(consoleInfo).not.toHaveBeenCalled();
  });

  it("does not throw when the transport fails", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_WEB_VITALS_ENDPOINT", "https://collector.test/vitals");
    sendBeacon.mockImplementation(() => {
      throw new Error("offline");
    });

    expect(() => reportWebVital(metric())).not.toThrow();
  });

  it("omits an invalid navigation URL", () => {
    vi.stubEnv("NODE_ENV", "development");

    reportWebVital(metric({ navigationURL: "http://[invalid" }));

    expect(consoleInfo).toHaveBeenCalledWith(
      "[web-vitals]",
      expect.objectContaining({ navigationURL: undefined }),
    );
  });

  it("ignores metrics outside the Core Web Vitals set", () => {
    vi.stubEnv("NODE_ENV", "development");

    reportWebVital(metric({ name: "CUSTOM" }));

    expect(consoleInfo).not.toHaveBeenCalled();
    expect(sendBeacon).not.toHaveBeenCalled();
  });
});
