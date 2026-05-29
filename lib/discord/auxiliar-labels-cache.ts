const TTL_MS = 5 * 60 * 1000;

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
  cacheKey: string;
};

function getFromCache<T>(
  store: CacheEntry<T> | null,
  cacheKey: string,
): T | null {
  if (!store || store.cacheKey !== cacheKey || store.expiresAt <= Date.now()) {
    return null;
  }
  return store.data;
}

function setCache<T>(
  data: T,
  cacheKey: string,
): CacheEntry<T> {
  return { data, cacheKey, expiresAt: Date.now() + TTL_MS };
}

let produtosCache: CacheEntry<AuxiliarProdutoRow[]> | null = null;
let projetosCache: CacheEntry<AuxiliarProjetoRow[]> | null = null;

export interface AuxiliarProdutoRow {
  id: number;
  nome_projeto: string;
}

export interface AuxiliarProjetoRow {
  id: string;
  nome_projeto: string;
}

export async function getCachedProdutosList(
  authCacheKey: string,
  fetcher: () => Promise<AuxiliarProdutoRow[]>,
): Promise<AuxiliarProdutoRow[]> {
  const cached = getFromCache(produtosCache, authCacheKey);
  if (cached) return cached;
  const data = await fetcher();
  produtosCache = setCache(data, authCacheKey);
  return data;
}

export async function getCachedProjetosList(
  cacheKey: string,
  fetcher: () => Promise<AuxiliarProjetoRow[]>,
): Promise<AuxiliarProjetoRow[]> {
  const cached = getFromCache(projetosCache, cacheKey);
  if (cached) return cached;
  const data = await fetcher();
  projetosCache = setCache(data, cacheKey);
  return data;
}
