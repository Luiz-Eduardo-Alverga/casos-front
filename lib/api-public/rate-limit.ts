type RateLimitState = {
  count: number;
  resetAtMs: number;
};

type RateLimitResult =
  | { ok: true; limit: number; remaining: number; resetAtMs: number }
  | { ok: false; limit: number; remaining: number; resetAtMs: number };

function getStore(): Map<string, RateLimitState> {
  const g = globalThis as unknown as { __casosPublicRateLimit?: Map<string, RateLimitState> };
  if (!g.__casosPublicRateLimit) g.__casosPublicRateLimit = new Map<string, RateLimitState>();
  return g.__casosPublicRateLimit;
}

export function rateLimitByKey(params: {
  key: string;
  limit: number;
  windowMs: number;
  nowMs?: number;
}): RateLimitResult {
  const now = params.nowMs ?? Date.now();
  const store = getStore();
  const cur = store.get(params.key);

  if (!cur || cur.resetAtMs <= now) {
    const next: RateLimitState = { count: 1, resetAtMs: now + params.windowMs };
    store.set(params.key, next);
    return {
      ok: true,
      limit: params.limit,
      remaining: Math.max(0, params.limit - next.count),
      resetAtMs: next.resetAtMs,
    };
  }

  cur.count += 1;
  store.set(params.key, cur);
  const remaining = Math.max(0, params.limit - cur.count);
  return {
    ok: cur.count <= params.limit,
    limit: params.limit,
    remaining,
    resetAtMs: cur.resetAtMs,
  };
}

