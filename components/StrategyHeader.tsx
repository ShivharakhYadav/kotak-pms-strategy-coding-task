import { formatCurrency, formatDate } from "@/lib/format";
import type { Strategy } from "@/lib/types/strategy";

interface StrategyHeaderProps {
  strategy: Pick<
    Strategy,
    "name" | "fundManagerName" | "inceptionDate" | "benchmark" | "minimumInvestment"
  >;
}

export function StrategyHeader({ strategy }: StrategyHeaderProps) {
  const facts = [
    { label: "Fund Manager", value: strategy.fundManagerName },
    { label: "Inception Date", value: formatDate(strategy.inceptionDate) },
    { label: "Benchmark", value: strategy.benchmark },
    { label: "Minimum Investment", value: formatCurrency(strategy.minimumInvestment) },
  ];

  return (
    <header className="border-b border-gray-200 pb-6">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">{strategy.name}</h1>
      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-sm text-gray-500">{fact.label}</dt>
            <dd className="text-base font-medium text-gray-900">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
