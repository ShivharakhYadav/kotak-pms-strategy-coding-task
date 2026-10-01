import { formatPercent } from "@/lib/format";
import { getTopHoldings } from "@/lib/services/strategyService";
import type { Holding } from "@/lib/types/strategy";

interface HoldingsListProps {
  holdings: Holding[];
  count?: number;
}

export function HoldingsList({ holdings, count = 5 }: HoldingsListProps) {
  const topHoldings = getTopHoldings(holdings, count);

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900">Top Holdings</h2>
      <ol className="mt-3 divide-y divide-gray-200 rounded-lg border border-gray-200">
        {topHoldings.map((holding, index) => (
          <li
            key={holding.stockName}
            className="flex items-center justify-between px-4 py-2 text-sm"
          >
            <span className="text-gray-900">
              <span className="text-gray-400 mr-2">{index + 1}.</span>
              {holding.stockName}
            </span>
            <span className="font-medium text-gray-900">
              {formatPercent(holding.allocationPercentage)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
