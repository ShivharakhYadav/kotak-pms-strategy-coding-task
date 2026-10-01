import { formatPercent } from "@/lib/format";
import type { ReturnPeriod, TrailingReturn } from "@/lib/types/strategy";

const DISPLAY_PERIODS: { period: ReturnPeriod; label: string }[] = [
  { period: "1Y", label: "1 Year" },
  { period: "3Y", label: "3 Years" },
  { period: "5Y", label: "5 Years" },
  { period: "SI", label: "Since Inception" },
];

interface TrailingReturnsTableProps {
  trailingReturns: TrailingReturn[];
}

export function TrailingReturnsTable({ trailingReturns }: TrailingReturnsTableProps) {
  const byPeriod = new Map(trailingReturns.map((r) => [r.period, r]));

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900">Trailing Returns</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <caption className="sr-only">
            Strategy trailing returns compared to benchmark across standard periods
          </caption>
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500">
                Period
              </th>
              <th scope="col" className="px-4 py-2 text-right font-medium text-gray-500">
                Strategy
              </th>
              <th scope="col" className="px-4 py-2 text-right font-medium text-gray-500">
                Benchmark
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {DISPLAY_PERIODS.map(({ period, label }) => {
              const row = byPeriod.get(period);
              if (!row) return null;
              return (
                <tr key={period}>
                  <th scope="row" className="px-4 py-2 text-left font-medium text-gray-900">
                    {label}
                  </th>
                  <td className="px-4 py-2 text-right text-gray-900">
                    {formatPercent(row.strategyReturn)}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-500">
                    {formatPercent(row.benchmarkReturn)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
