# Part D — Written Diagnostics

## 1. SSR, SSG/ISR, or CSR for this page — and why?

**ISR.** The brief itself frames this page as "largely static/reference data that rarely
changes intraday," and the implementation follows that directly rather than just asserting
it: `app/strategy/[slug]/page.tsx` sets `export const revalidate = 3600`, and its self-fetch
to `/api/strategies/[slug]` passes `next: { revalidate: 3600 }`; the API route itself also
sets `export const revalidate = 3600`. In practice that means the first visitor after an hour
triggers a background regeneration, every other visitor in that window gets a cached response,
and nobody waits on a cold data fetch on every request the way pure SSR (`revalidate: 0` /
`no-store`) would force. Pure CSR would be worse here: it would ship an empty shell, require a
client-side round trip before anything meaningful paints, and buys nothing since there's no
per-user personalization on this page — everyone sees the same strategy data. ISR gets
CDN-cacheable, fast responses while still picking up data changes within an hour, which is the
right trade-off for reference data that's updated occasionally (e.g., daily/weekly NAV or
holdings refreshes) rather than in real time.

## 2. Concurrent admin updates to the same strategy entry — what could go wrong, and how to prevent it?

With the current in-memory array there's no protection at all — this is a stated limitation of
the sample scope, not an oversight. If it had to support concurrent admin edits, the classic
failure mode is a **lost update**: admin A loads the record, admin B loads the same record,
B saves their change, then A saves their (now stale) change and silently overwrites B's edit
with no error to either party. A second, subtler failure is a **torn/partial write** — if an
update isn't applied atomically (e.g., holdings written in one step and trailing returns in
another), a reader could observe a strategy with inconsistent state mid-update.

The standard fix is **optimistic concurrency control**: give each strategy record a
`version` (or `updatedAt`) field, require every update request to include the version it was
read at, and have the write path do a compare-and-swap — `UPDATE ... WHERE version = :expected`
(or the in-memory equivalent) — incrementing the version on success. If the version doesn't
match, reject the write with `409 Conflict` and let the client re-fetch and retry, rather than
silently clobbering the other admin's change. For higher write contention than that pattern
comfortably handles, a single-writer queue (all writes for a given slug serialized through one
worker) avoids the race entirely at the cost of write throughput — unnecessary here since
strategy edits are a low-frequency, low-concurrency admin operation, but worth naming as the
next step up.

## 3. State management as the page and calculator grow more complex — what would you reach for, and why?

Today, `useState` + `useMemo` is enough: the calculator's state is small, synchronous, and
entirely local to one component (`components/FeeCalculator.tsx`), and the page's data is a
single server-fetched object with no client-side mutation. I'd resist reaching for a global
store prematurely — Redux Toolkit in particular would be solving a problem this page doesn't
have (cross-cutting, app-wide state shared by many disconnected components).

As real complexity arrives, I'd split the decision by what's actually growing:

- **Server-derived data** (the strategy record, and especially anything that becomes
  client-fetched rather than server-rendered — e.g., a strategy picker, comparison across
  multiple strategies, or admin-side live updates) is exactly what **React Query** (or SWR) is
  for: it owns caching, revalidation, request de-duplication, and loading/error states that I'd
  otherwise be hand-rolling in `useEffect`. This is the first thing I'd introduce, and it
  wouldn't replace the server-side fetch in `page.tsx` so much as sit alongside it for any
  future client-side interactivity (e.g., refreshing the strategy without a full page reload).
- **Calculator/UI state** should stay local (`useState`/`useMemo`) for as long as it's used by
  one component subtree. I'd reach for **Context** only if a handful of sibling components
  genuinely need to read the same derived values without prop-drilling through 3+ layers —
  e.g., if the breakdown needed to be shown in both an inline widget and a sticky summary bar
  simultaneously.
- **Zustand** is where I'd go if calculator state needed to persist across navigations or be
  shared between distant, unrelated parts of the tree — e.g., a "saved scenarios" feature where
  a user builds several what-if calculations and compares them from a different page. It's
  lighter-weight than Redux Toolkit for that kind of client-only shared state and doesn't need
  the ceremony (actions/reducers/slices) RTK brings for a problem this small.

In short: React Query for anything crossing the network, local state for anything that doesn't
need to leave the component, and Context/Zustand only once there's a concrete cross-component
sharing need — not in anticipation of one.
