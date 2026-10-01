const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

interface Bucket {
  count: number;
  windowStart: number;
}

/**
 * In-memory fixed-window rate limiter, scoped to a single process.
 *
 * This is enough to blunt an accidental or abusive burst against a demo API
 * that has no other auth layer in front of it. It is NOT sufficient for a
 * multi-instance or serverless production deployment: each instance has its
 * own Map, so a client distributed across instances could exceed the limit
 * by that factor. A real deployment needs a shared store (e.g. Upstash
 * Redis) so the count is enforced across all instances.
 */
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkRateLimit(
  identifier: string,
  now: number = Date.now()
): RateLimitResult {
  const bucket = buckets.get(identifier);

  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    buckets.set(identifier, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  bucket.count += 1;
  return { allowed: true };
}

export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}
