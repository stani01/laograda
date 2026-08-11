import type { NextRequest } from "next/server";

/**
 * Minimal in-memory, per-IP rate limiter for public POST endpoints (booking
 * requests, contact form, guest registration) — a defense-in-depth measure
 * against basic scripted spam, on top of the honeypot field already used on
 * these forms.
 *
 * Deliberately simple (no Redis/Upstash dependency): state lives in the
 * function instance's memory, so it resets on cold start and isn't shared
 * across concurrent instances. That means it won't stop a distributed
 * attack, but it does meaningfully slow down the common case of a single
 * script/bot hammering a route. If real abuse shows up in production,
 * upgrade to a shared store (e.g. Upstash Redis) instead.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically forget old buckets so this Map can't grow unbounded across a
// long-lived warm instance.
const MAX_TRACKED_KEYS = 5000;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Returns true if the request is allowed, false if it should be rejected
 * with a 429. `key` should include a route-specific prefix so different
 * endpoints don't share the same budget.
 */
export function checkRateLimit(
  request: NextRequest,
  routeKey: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): boolean {
  const ip = getClientIp(request);
  const key = `${routeKey}:${ip}`;
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [k, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(k);
    }
  }

  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= limit) {
    return false;
  }

  existing.count += 1;
  return true;
}
