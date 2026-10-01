import { describe, expect, it } from "vitest";
import { getStrategyBySlug, getStrategySummary, getTopHoldings } from "./strategyService";
import type { Holding } from "@/lib/types/strategy";

describe("getTopHoldings", () => {
  const holdings: Holding[] = [
    { stockName: "A", allocationPercentage: 5 },
    { stockName: "B", allocationPercentage: 9 },
    { stockName: "C", allocationPercentage: 2 },
    { stockName: "D", allocationPercentage: 7 },
  ];

  it("returns the top N holdings sorted descending by allocation", () => {
    expect(getTopHoldings(holdings, 2)).toEqual([
      { stockName: "B", allocationPercentage: 9 },
      { stockName: "D", allocationPercentage: 7 },
    ]);
  });

  it("truncates to the full list if n exceeds the array length", () => {
    expect(getTopHoldings(holdings, 10)).toHaveLength(4);
  });

  it("does not mutate the original array", () => {
    const copy = [...holdings];
    getTopHoldings(holdings, 2);
    expect(holdings).toEqual(copy);
  });
});

describe("getStrategyBySlug", () => {
  it("finds the known sample strategy", () => {
    expect(getStrategyBySlug("kotak-sample-focus-portfolio")).toBeDefined();
  });

  it("returns undefined for an unknown slug", () => {
    expect(getStrategyBySlug("does-not-exist")).toBeUndefined();
  });

  it("returns undefined for a malformed/unsafe slug instead of throwing", () => {
    expect(getStrategyBySlug("../../etc/passwd")).toBeUndefined();
    expect(getStrategyBySlug("")).toBeUndefined();
    expect(getStrategyBySlug("DROP TABLE strategies;")).toBeUndefined();
  });
});

describe("getStrategySummary", () => {
  it("trims holdings to the top 3, sorted descending", () => {
    const summary = getStrategySummary("kotak-sample-focus-portfolio");
    expect(summary).toBeDefined();
    expect(summary!.topHoldings).toHaveLength(3);
    const allocations = summary!.topHoldings.map((h) => h.allocationPercentage);
    expect(allocations).toEqual([...allocations].sort((a, b) => b - a));
  });

  it("includes the full trailingReturns list, not trimmed", () => {
    const summary = getStrategySummary("kotak-sample-focus-portfolio");
    expect(summary!.trailingReturns.length).toBeGreaterThanOrEqual(7);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getStrategySummary("does-not-exist")).toBeUndefined();
  });
});
