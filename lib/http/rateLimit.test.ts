import { describe, expect, it } from "vitest";
import { checkRateLimit, getClientIdentifier } from "./rateLimit";

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const id = "test-client-under-limit";
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit(id).allowed).toBe(true);
    }
  });

  it("blocks the request once the limit is exceeded within the window", () => {
    const id = "test-client-over-limit";
    for (let i = 0; i < 30; i++) {
      checkRateLimit(id);
    }
    const result = checkRateLimit(id);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets the count once the window has elapsed", () => {
    const id = "test-client-window-reset";
    const start = 1_000_000;
    for (let i = 0; i < 30; i++) {
      checkRateLimit(id, start);
    }
    expect(checkRateLimit(id, start).allowed).toBe(false);
    expect(checkRateLimit(id, start + 60_001).allowed).toBe(true);
  });

  it("tracks different identifiers independently", () => {
    const a = "test-client-a";
    const b = "test-client-b";
    for (let i = 0; i < 30; i++) checkRateLimit(a);
    expect(checkRateLimit(a).allowed).toBe(false);
    expect(checkRateLimit(b).allowed).toBe(true);
  });
});

describe("getClientIdentifier", () => {
  it("reads the first IP from x-forwarded-for", () => {
    const request = new Request("http://localhost/api/strategies/x", {
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
    });
    expect(getClientIdentifier(request)).toBe("203.0.113.5");
  });

  it("falls back to 'unknown' when the header is absent", () => {
    const request = new Request("http://localhost/api/strategies/x");
    expect(getClientIdentifier(request)).toBe("unknown");
  });
});
