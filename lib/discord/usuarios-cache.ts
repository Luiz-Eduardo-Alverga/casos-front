import type { AuxiliarUsuarioDiscord } from "@/lib/discord/types";

const TTL_MS = 5 * 60 * 1000;

type CacheEntry = {
  data: AuxiliarUsuarioDiscord[];
  expiresAt: number;
  cacheKey: string;
};

let usuariosCache: CacheEntry | null = null;

export async function getCachedUsuarios(
  cacheKey: string,
  fetcher: () => Promise<AuxiliarUsuarioDiscord[]>,
): Promise<AuxiliarUsuarioDiscord[]> {
  const now = Date.now();
  if (
    usuariosCache &&
    usuariosCache.cacheKey === cacheKey &&
    usuariosCache.expiresAt > now
  ) {
    return usuariosCache.data;
  }

  const data = await fetcher();
  usuariosCache = { data, cacheKey, expiresAt: now + TTL_MS };
  return data;
}
