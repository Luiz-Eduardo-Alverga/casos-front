import { jsonError, jsonOk, handleDbRouteError } from "@/lib/api-db/responses";
import { listAcquirers } from "@/lib/db/acquirers";
import { getPublishedConfigDocByAcquirer } from "@/lib/db/docs";
import { getRequestIp } from "@/lib/api-public/request-ip";
import { rateLimitByKey } from "@/lib/api-public/rate-limit";
import { opaqueId } from "@/lib/api-public/opaque-id";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;

type RouteCtx = { params: Promise<{ id: string }> };

function withPublicCacheHeaders(res: Response): Response {
  res.headers.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
  );
  return res;
}

function withRateLimitHeaders(
  res: Response,
  rl: { limit: number; remaining: number; resetAtMs: number },
): Response {
  res.headers.set("RateLimit-Limit", String(rl.limit));
  res.headers.set("RateLimit-Remaining", String(rl.remaining));
  res.headers.set("RateLimit-Reset", String(Math.ceil(rl.resetAtMs / 1000)));
  return res;
}

function isOpaqueAcquirerId(value: string): boolean {
  return /^acq_[A-Za-z0-9_-]{16,32}$/.test(value);
}

export async function GET(request: Request, context: RouteCtx) {
  const ip = getRequestIp(request);
  const rl = rateLimitByKey({
    key: `public-acquirer-doc:${ip}`,
    limit: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (!rl.ok) {
    const res = jsonError(
      "Muitas requisições. Tente novamente em instantes.",
      429,
    );
    withRateLimitHeaders(res, rl);
    return withPublicCacheHeaders(res);
  }

  if (!process.env.PUBLIC_OPAQUE_ID_SECRET?.trim()) {
    const res = jsonError(
      "Configuração ausente: defina PUBLIC_OPAQUE_ID_SECRET no ambiente do servidor.",
      500,
    );
    withRateLimitHeaders(res, rl);
    return withPublicCacheHeaders(res);
  }

  const { id } = await context.params;
  if (!isOpaqueAcquirerId(id)) {
    const res = jsonError("Adquirente não encontrada", 404);
    withRateLimitHeaders(res, rl);
    return withPublicCacheHeaders(res);
  }

  try {
    const acquirers = await listAcquirers();
    const match = acquirers.find((row) => opaqueId("acq", row.id) === id);
    if (!match) {
      const res = jsonError("Adquirente não encontrada", 404);
      withRateLimitHeaders(res, rl);
      return withPublicCacheHeaders(res);
    }

    const doc = await getPublishedConfigDocByAcquirer(match.id);
    const res = jsonOk(doc);
    withRateLimitHeaders(res, rl);
    return withPublicCacheHeaders(res);
  } catch (error) {
    const res = handleDbRouteError(
      error,
      "[api/public/acquirers/[id]/documentacao GET]",
    );
    withRateLimitHeaders(res, rl);
    return withPublicCacheHeaders(res);
  }
}
