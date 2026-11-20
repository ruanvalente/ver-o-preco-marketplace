"use client";

import { useReportWebVitals } from "next/web-vitals";

import { reportWebVital } from "./report-web-vital";

const handleWebVitals: Parameters<typeof useReportWebVitals>[0] = (metric) => {
  reportWebVital(metric);
};

export function WebVitals() {
  useReportWebVitals(handleWebVitals);

  return null;
}
