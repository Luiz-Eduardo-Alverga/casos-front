import { jsonError, jsonOk, handleDbRouteError } from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { listAcquirersExpanded } from "@/lib/db/acquirers-expanded";
import { statusTypeSchema } from "@/lib/validators/db/shared";
import { getRequestIp } from "@/lib/api-public/request-ip";
import { rateLimitByKey } from "@/lib/api-public/rate-limit";
import { opaqueId } from "@/lib/api-public/opaque-id";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;

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

export async function GET(request: Request) {
  const ip = getRequestIp(request);
  const rl = rateLimitByKey({
    key: `public-acquirers:${ip}`,
    limit: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (!rl.ok) {
    const res = jsonError("Muitas requisições. Tente novamente em instantes.", 429);
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

  try {
    const sp = new URL(request.url).searchParams;
    const search = sp.get("search") ?? undefined;
    const rawStatus = sp.get("status");
    let statusFilter: string | undefined;
    if (rawStatus != null && rawStatus.trim()) {
      const parsed = statusTypeSchema.safeParse(rawStatus.trim());
      if (!parsed.success) {
        const res = badRequestFromZod(parsed.error);
        withRateLimitHeaders(res, rl);
        return withPublicCacheHeaders(res);
      }
      statusFilter = parsed.data;
    }

    const rows = await listAcquirersExpanded(search, statusFilter);
    const orderedRows = [...rows].sort((a, b) => {
      const ao = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.acquirer.name.localeCompare(b.acquirer.name, "pt-BR");
    });

    // Whitelist explícita do payload público (evita vazamentos por adição futura de colunas).
    const publicRows = orderedRows.map((r) => ({
      acquirer: {
        id: opaqueId("acq", r.acquirer.id),
        name: r.acquirer.name,
        logoUrl: r.acquirer.logoUrl ?? null,
        has4g: r.acquirer.has4g,
        createdAt: r.acquirer.createdAt ?? null,
      },
      acquirerStatusId:
        r.acquirerStatusId != null ? opaqueId("st", r.acquirerStatusId) : null,
      sortOrder: r.sortOrder,
      status: r.status,
      currentVersionName: r.currentVersionName,
      nextVersionName: r.nextVersionName,
      deliveryDate: r.deliveryDate,
      recommendedDeviceId:
        r.recommendedDeviceId != null
          ? opaqueId("dev", r.recommendedDeviceId)
          : null,
      compatibleDevices: r.compatibleDevices.map((d) => ({
        deviceId: opaqueId("dev", d.deviceId),
        deviceName: d.deviceName,
        androidVersion: d.androidVersion,
        isPrimary: d.isPrimary,
      })),
    }));

    const res = jsonOk(publicRows);
    withRateLimitHeaders(res, rl);
    return withPublicCacheHeaders(res);
  } catch (e) {
    const res = handleDbRouteError(e, "[api/public/acquirers GET]");
    withRateLimitHeaders(res, rl);
    return withPublicCacheHeaders(res);
  }
}

