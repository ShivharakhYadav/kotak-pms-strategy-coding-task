import { handleGetStrategy } from "@/lib/http/handlers/strategyHandlers";

export const revalidate = 3600;

/**
 * Unversioned alias kept exactly as-is for backward compatibility and
 * because it mirrors the literal path this project's internal page fetches
 * were originally built against. New consumers should prefer /api/v1/...
 * (see app/api/v1/strategies/[slug]/route.ts) — both call the same handler,
 * so behavior is identical.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return handleGetStrategy(request, slug);
}
