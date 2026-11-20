import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { WebVitals } from "./web-vitals";

const mocks = vi.hoisted(() => ({
  useReportWebVitals: vi.fn(),
  reportWebVital: vi.fn(),
}));

vi.mock("next/web-vitals", () => ({
  useReportWebVitals: mocks.useReportWebVitals,
}));

vi.mock("./report-web-vital", () => ({
  reportWebVital: mocks.reportWebVital,
}));

describe("WebVitals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers a single stable callback that forwards metrics", () => {
    const { container, unmount } = render(<WebVitals />);

    expect(mocks.useReportWebVitals).toHaveBeenCalledTimes(1);
    expect(container.firstChild).toBeNull();

    const callback = mocks.useReportWebVitals.mock.calls[0][0];
    const reportedMetric = { name: "CLS", value: 0.02 };
    callback(reportedMetric);
    expect(mocks.reportWebVital).toHaveBeenCalledWith(reportedMetric);

    unmount();
    render(<WebVitals />);
    expect(mocks.useReportWebVitals.mock.calls[1][0]).toBe(callback);
  });
});
