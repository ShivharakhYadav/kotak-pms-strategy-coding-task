import { handleGetStrategySummary } from "@/lib/http/handlers/strategyHandlers";

export const revalidate = 3600;

/**
 * This is the exact path specified by the coding task's Part B
 * ("GET /api/strategies/:slug/summary"), kept working unchanged. New
 * consumers should prefer /api/v1/strategies/[slug]/summary — both call
 * the same handler, so the response shape is identical.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return handleGetStrategySummary(request, slug);
}
