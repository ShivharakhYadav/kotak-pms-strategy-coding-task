import { strategies } from "@/lib/data/strategies";
import type { Holding, Strategy, StrategySummary } from "@/lib/types/strategy";

const SLUG_PATTERN = /^[a-z0-9-]{1,100}$/;

function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

export function getStrategyBySlug(slug: string): Strategy | undefined {
  if (!isValidSlug(slug)) return undefined;
  return strategies.find((s) => s.slug === slug);
}

export function getTopHoldings(holdings: Holding[], n: number): Holding[] {
  return [...holdings]
    .sort((a, b) => b.allocationPercentage - a.allocationPercentage)
    .slice(0, n);
}

export function getStrategySummary(slug: string): StrategySummary | undefined {
  const strategy = getStrategyBySlug(slug);
  if (!strategy) return undefined;

  return {
    name: strategy.name,
    fundManagerName: strategy.fundManagerName,
    minimumInvestment: strategy.minimumInvestment,
    trailingReturns: strategy.trailingReturns,
    topHoldings: getTopHoldings(strategy.holdings, 3),
  };
}
