import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/http/getBaseUrl";
import { StrategyHeader } from "@/components/StrategyHeader";
import { TrailingReturnsTable } from "@/components/TrailingReturnsTable";
import { HoldingsList } from "@/components/HoldingsList";
import { FeeCalculator } from "@/components/FeeCalculator";
import type { Strategy } from "@/lib/types/strategy";

export const revalidate = 3600;

async function fetchStrategy(slug: string): Promise<Strategy | null> {
  const res = await fetch(`${getBaseUrl()}/api/v1/strategies/${slug}`, {
    next: { revalidate: 3600 },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch strategy "${slug}"`);

  return res.json();
}

export default async function StrategyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const strategy = await fetchStrategy(slug);

  if (!strategy) {
    notFound();
  }

  const siReturn =
    strategy.trailingReturns.find((r) => r.period === "SI")?.strategyReturn ?? 0;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <StrategyHeader strategy={strategy} />
      <TrailingReturnsTable trailingReturns={strategy.trailingReturns} />
      <HoldingsList holdings={strategy.holdings} count={5} />
      <FeeCalculator strategyReturn={siReturn} returnLabel="Since Inception" />
    </main>
  );
}
