import { NextResponse } from "next/server";
import { getStrategyBySlug, getStrategySummary } from "@/lib/services/strategyService";
import { checkRateLimit, getClientIdentifier } from "@/lib/http/rateLimit";

function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

function notFoundResponse(slug: string) {
  return NextResponse.json({ error: `No strategy found for "${slug}".` }, { status: 404 });
}

/**
 * Shared by both the versioned (/api/v1/...) and unversioned (/api/...)
 * route files so the 404/429/500 shaping lives in exactly one place.
 */
export async function handleGetStrategy(request: Request, slug: string) {
  const rate = checkRateLimit(getClientIdentifier(request));
  if (!rate.allowed) return rateLimitResponse(rate.retryAfterSeconds!);

  try {
    const strategy = getStrategyBySlug(slug);
    if (!strategy) return notFoundResponse(slug);
    return NextResponse.json(strategy);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while fetching the strategy." },
      { status: 500 }
    );
  }
}

export async function handleGetStrategySummary(request: Request, slug: string) {
  const rate = checkRateLimit(getClientIdentifier(request));
  if (!rate.allowed) return rateLimitResponse(rate.retryAfterSeconds!);

  try {
    const summary = getStrategySummary(slug);
    if (!summary) return notFoundResponse(slug);
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while fetching the strategy summary." },
      { status: 500 }
    );
  }
}
