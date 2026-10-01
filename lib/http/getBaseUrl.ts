/**
 * Resolves an absolute base URL for server-side self-fetches to this app's
 * own API routes. Never derived from user input — safe against SSRF.
 */
export function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}`;
}
