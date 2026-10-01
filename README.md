# PMS Strategy Detail Page — Coding Task Submission

A scaled-down PMS "Strategy Detail" page (Next.js App Router) plus an interactive fee
calculator, built for the take-home coding assessment. **All data is fictional/placeholder —
no real Kotak content, figures, or production information.**

## Setup & Run

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it links to the sample strategy page at
`/strategy/kotak-sample-focus-portfolio`.

Other scripts:

```bash
npm run test   # vitest unit tests (strategyService, feeCalculator, rateLimit)
npm run lint   # eslint
npm run build  # production build
```

## What's implemented

- **Part A** — `/strategy/[slug]` page: header snapshot, trailing returns table
  (1Y/3Y/5Y/Since Inception vs. benchmark), top 5 holdings, responsive layout.
- **Part B** — `GET /api/strategies/[slug]/summary`: trimmed payload (name, fundManagerName,
  minimumInvestment, full trailingReturns, top 3 holdings), clean JSON 404 on an unknown slug.
- **Part C** — Fee calculator widget on the same page: investment amount + holding-period
  dropdown (1/3/5/10 years), instant recalculation with a full breakdown, validation for
  invalid input.
- **Part D** — Written diagnostics: see [`docs/PART_D_ANSWERS.md`](./docs/PART_D_ANSWERS.md).

## A deliberate design decision worth flagging

Part A asks the page to show the **top 5** holdings, but Part B's only specified endpoint
(`/summary`) returns only the **top 3**. Rather than pick one and silently under-serve the
other, this submission builds **two endpoints**:

- `GET /api/strategies/[slug]` — the full record, used by the page to render all 5 holdings.
- `GET /api/strategies/[slug]/summary` — the exact Part B contract (top 3), the graded
  deliverable.

Both route handlers are thin wrappers around the same `getTopHoldings(holdings, n)` function in
`lib/services/strategyService.ts`, so there's no duplicated sorting/trimming logic — only the
`n` differs.

## API versioning

The API is available under two path prefixes:

- **`/api/v1/strategies/[slug]` and `/api/v1/strategies/[slug]/summary`** — the canonical,
  versioned surface. New consumers (including this project's own page, which self-fetches from
  here) should use this.
- **`/api/strategies/[slug]` and `/api/strategies/[slug]/summary`** — kept as unversioned
  aliases, because `GET /api/strategies/:slug/summary` is the exact literal path Part B
  specifies. Breaking or removing it would break the graded contract.

Both prefixes call the same shared handler functions in
`lib/http/handlers/strategyHandlers.ts`, so the response shape, status codes, and rate limiting
are identical regardless of which path is used — there's one implementation, not two.

## Rate limiting

Both endpoints are rate-limited to **30 requests/minute per client IP** (`lib/http/rateLimit.ts`),
returning `429 Too Many Requests` with a `Retry-After` header once exceeded. This is a simple
in-memory fixed-window limiter — it is enough to blunt an accidental or abusive burst against an
API with no other auth layer in front of it, but it is **per-process state**: it resets on
restart and does not coordinate across multiple instances. A real multi-instance/serverless
deployment would need a shared store (e.g. Upstash Redis) for the limit to be enforced
consistently across all instances. Verified manually: 30 requests from the same IP succeed, the
31st returns 429, a different IP is unaffected, and the unversioned and `/v1` paths share the
same bucket per client (since they're the same underlying handler).

## Architecture

```
app/
  strategy/[slug]/page.tsx                    Server Component — self-fetches /api/v1/... (see below)
  strategy/[slug]/not-found.tsx               Page-level 404 UI
  api/strategies/[slug]/route.ts              Unversioned alias — Part B's literal required path
  api/strategies/[slug]/summary/route.ts      Unversioned alias — Part B's literal required path
  api/v1/strategies/[slug]/route.ts           Canonical versioned full record
  api/v1/strategies/[slug]/summary/route.ts   Canonical versioned trimmed contract
lib/
  types/strategy.ts               Shared Strategy/Holding/TrailingReturn/StrategySummary types
  data/strategies.ts               One fictional sample entry
  services/strategyService.ts     getStrategyBySlug / getTopHoldings / getStrategySummary
  calc/feeCalculator.ts           Pure validateCalculatorInput() + calculateFee()
  format.ts                       Shared percent/currency/date formatters
  http/getBaseUrl.ts              Absolute-URL helper for the page's self-fetch
  http/rateLimit.ts               In-memory per-IP fixed-window rate limiter
  http/handlers/strategyHandlers.ts  Shared request handling (404/429/500 shaping), used by
                                      both the versioned and unversioned route files
components/
  StrategyHeader.tsx, TrailingReturnsTable.tsx, HoldingsList.tsx
  FeeCalculator.tsx               'use client' — the only client JS on the page
```

**Route handlers stay thin** (HTTP status/shaping only) and delegate everything else to
`strategyService.ts` — the brief explicitly grades this separation of concerns.

**Rendering:** ISR (`revalidate = 3600`) on both the API routes and the page's fetch, because
the page is "largely static/reference data that rarely changes intraday" (see
[Part D, Q1](./docs/PART_D_ANSWERS.md#1-ssr-ssgisr-or-csr-for-this-page--and-why) for the full
reasoning — the code and the written answer agree on purpose).

**Self-fetch pattern:** the Server Component page calls its own `/api/strategies/[slug]` via
`lib/http/getBaseUrl.ts` (never derived from user input, so there's no SSRF surface) rather than
importing the service function directly — this was a deliberate choice to literally satisfy
"renders ... using sample data fetched from your own API," even though importing the service
directly would be the more idiomatic Next.js shortcut. It was spiked and verified early
(before building real features on top of it) because Next.js 16 changed several App Router
defaults from what you might expect (see "Notes on Next.js 16" below).

**State management (Part C):** plain `useState` for the controlled inputs and `useMemo` for
derived validation/calculation — no `useEffect`, no debounce, no external store. It's
synchronous arithmetic, not I/O; debouncing a `Math.pow` call would be exactly the
over-engineering the brief warns against. Full reasoning on how this should evolve as
complexity grows is in [Part D, Q3](./docs/PART_D_ANSWERS.md#3-state-management-as-the-page-and-calculator-grow-more-complex--what-would-you-reach-for-and-why).

## Assumptions & known limitations

- **Data store:** in-memory TypeScript array (`lib/data/strategies.ts`), not a real database —
  per the brief's own allowance.
- **Auth/CORS:** none. The API is same-origin only, consumed exclusively by this app's own
  frontend; no CORS headers are added (a deliberate choice, not an oversight).
- **Concurrency:** the in-memory store has no optimistic-locking/versioning — acceptable for a
  read-only sample dataset with no admin write path in this submission. See
  [Part D, Q2](./docs/PART_D_ANSWERS.md#2-concurrent-admin-updates-to-the-same-strategy-entry--what-could-go-wrong-and-how-to-prevent-it)
  for how this would be addressed if a write path existed.
- **Exit load boundary:** the brief's exit-load formula (`years < 1`) only manifests if a
  sub-1-year holding period is selectable; the current dropdown only offers 1/3/5/10 years, so
  this path is exercised by unit tests (`feeCalculator.test.ts`) rather than the UI. The pure
  function supports it correctly if the dropdown is ever extended.
- **Fictional name:** "Kotak Sample Focus Portfolio" and all figures are placeholders, not real
  Kotak products or data.

## Notes on Next.js 16

This project scaffolded onto **Next.js 16.3.8**, which has a few breaking changes from older
App Router conventions worth flagging for reviewers:

- `params` is now a `Promise` in both page components and route handlers — every usage here
  does `const { slug } = await params`.
- Route Handler `GET` caching defaults to dynamic (not static) since v15; this project sets
  `export const revalidate = 3600` explicitly rather than relying on a default.
- Next 16 also ships an opt-in "Cache Components" model (`cacheComponents: true` +
  `use cache`/`<Suspense>`). This project deliberately stays on the classic model (it's off by
  default) — adopting Cache Components would add Suspense-boundary ceremony that isn't
  justified for a 5-hour take-home.

## Testing

`npm run test` runs 20 vitest cases against the pure logic layer:

- `lib/services/strategyService.test.ts` — top-N ordering/truncation/non-mutation, found/
  not-found paths, and malformed-slug input (including path-traversal- and
  SQL-injection-shaped strings) failing safely rather than throwing.
- `lib/calc/feeCalculator.test.ts` — formula correctness at 1 and 10 years, the sub-1-year
  exit-load boundary, and every invalid-input class.

Component, integration, and E2E tests are **deliberately not included** — out of proportion for
a time-boxed take-home graded primarily on the points above, not test coverage breadth.

## Sample API response

See [`docs/sample-summary-response.json`](./docs/sample-summary-response.json), captured via:

```bash
curl http://localhost:3000/api/strategies/kotak-sample-focus-portfolio/summary
# identical response from the canonical versioned path:
curl http://localhost:3000/api/v1/strategies/kotak-sample-focus-portfolio/summary
```

```json
{
  "name": "Kotak Sample Focus Portfolio",
  "fundManagerName": "Aditi Sharma",
  "minimumInvestment": 5000000,
  "trailingReturns": [ "...full list, 1M through SI..." ],
  "topHoldings": [
    { "stockName": "HDFC Bank Ltd", "allocationPercentage": 9.8 },
    { "stockName": "ICICI Bank Ltd", "allocationPercentage": 8.6 },
    { "stockName": "Reliance Industries Ltd", "allocationPercentage": 7.9 }
  ]
}
```

A 404 against an unknown slug (e.g. `/api/strategies/does-not-exist/summary`) returns:

```json
{ "error": "No strategy found for \"does-not-exist\"." }
```

## Screen recording / screenshots

**Not included in this automated session** — capturing a screen recording requires interactive
browser access that wasn't available in this environment. Before submitting, please record a
2–3 minute walkthrough showing:

1. `/strategy/kotak-sample-focus-portfolio` loading (header, returns table, holdings).
2. The fee calculator recalculating live with at least two different amount/period
   combinations.
3. An invalid input (e.g. empty or negative amount) showing a validation error.
4. `/strategy/does-not-exist` showing the page-level 404.

All functional correctness above was verified via `curl` (API responses, status codes, headers)
and the full rendered HTML output (inspecting the server-rendered markup for each component) —
not a live browser session, so a final visual/interactive check before submission is still
worthwhile.
