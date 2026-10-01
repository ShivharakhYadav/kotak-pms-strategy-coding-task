export interface Holding {
  stockName: string;
  allocationPercentage: number;
}

export type ReturnPeriod = "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y" | "SI";

export interface TrailingReturn {
  period: ReturnPeriod;
  strategyReturn: number;
  benchmarkReturn: number;
}

export interface Strategy {
  slug: string;
  name: string;
  fundManagerName: string;
  inceptionDate: string;
  benchmark: string;
  minimumInvestment: number;
  trailingReturns: TrailingReturn[];
  holdings: Holding[];
}

/** Trimmed shape returned by GET /api/strategies/[slug]/summary (Part B contract). */
export interface StrategySummary {
  name: string;
  fundManagerName: string;
  minimumInvestment: number;
  trailingReturns: TrailingReturn[];
  topHoldings: Holding[];
}
