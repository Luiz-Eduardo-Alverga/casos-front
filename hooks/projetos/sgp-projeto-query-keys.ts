import type { QueryClient } from "@tanstack/react-query";

/** Query keys das listagens GET de stakeholders por projeto */
export const sgpStakesQueryKeys = {
  all: ["sgp-stakes"] as const,
  /** Todas as listagens por projeto (fallback sem id) */
  byProjetoRoot: ["sgp-stakes", "projeto"] as const,
  /** GET paginado: /projeto/{id} */
  byProjeto: (projetoId: number | string) =>
    ["sgp-stakes", "projeto", String(projetoId)] as const,
  /** GET infinite: /projeto/infinite/{id}/... */
  byProjetoInfinite: (projetoId: number | string) =>
    ["sgp-stakes", "projeto", "infinite", String(projetoId)] as const,
  list: (
    projetoId: number | string,
    per_page?: number | string,
    cursor?: string | null,
  ) =>
    [
      "sgp-stakes",
      "projeto",
      String(projetoId),
      per_page ?? "",
      cursor ?? "",
    ] as const,
  infinite: (projetoId: number | string, perPage?: number) =>
    [
      "sgp-stakes",
      "projeto",
      "infinite",
      String(projetoId),
      perPage ?? 15,
    ] as const,
};

/** Query keys das listagens GET de cronograma por projeto */
export const sgpCronogramaQueryKeys = {
  all: ["sgp-cronograma"] as const,
  byProjetoRoot: ["sgp-cronograma", "projeto"] as const,
  byProjeto: (projetoId: number | string) =>
    ["sgp-cronograma", "projeto", String(projetoId)] as const,
  byProjetoInfinite: (projetoId: number | string) =>
    ["sgp-cronograma", "projeto", "infinite", String(projetoId)] as const,
  list: (
    projetoId: number | string,
    per_page?: number | string,
    cursor?: string | null,
  ) =>
    [
      "sgp-cronograma",
      "projeto",
      String(projetoId),
      per_page ?? "",
      cursor ?? "",
    ] as const,
  infinite: (projetoId: number | string, perPage?: number) =>
    [
      "sgp-cronograma",
      "projeto",
      "infinite",
      String(projetoId),
      perPage ?? 15,
    ] as const,
};

/** Invalida listagens GET de cronograma após mutações futuras */
export async function invalidateSgpCronogramaQueries(
  queryClient: QueryClient,
  projetoId?: number | string | null,
) {
  const id =
    projetoId != null && String(projetoId) !== "" ? String(projetoId) : null;

  await queryClient.invalidateQueries({
    queryKey: id
      ? sgpCronogramaQueryKeys.byProjetoInfinite(id)
      : sgpCronogramaQueryKeys.byProjetoRoot,
  });
}

/** Query keys das listagens GET de riscos por projeto */
export const sgpRiscosQueryKeys = {
  all: ["sgp-riscos"] as const,
  byProjetoRoot: ["sgp-riscos", "projeto"] as const,
  byProjeto: (projetoId: number | string) =>
    ["sgp-riscos", "projeto", String(projetoId)] as const,
  byProjetoInfinite: (projetoId: number | string) =>
    ["sgp-riscos", "projeto", "infinite", String(projetoId)] as const,
  list: (
    projetoId: number | string,
    per_page?: number | string,
    cursor?: string | null,
  ) =>
    [
      "sgp-riscos",
      "projeto",
      String(projetoId),
      per_page ?? "",
      cursor ?? "",
    ] as const,
  infinite: (projetoId: number | string, perPage?: number) =>
    [
      "sgp-riscos",
      "projeto",
      "infinite",
      String(projetoId),
      perPage ?? 15,
    ] as const,
};

/** Invalida listagens GET de riscos após mutações futuras */
export async function invalidateSgpRiscosQueries(
  queryClient: QueryClient,
  projetoId?: number | string | null,
) {
  const id =
    projetoId != null && String(projetoId) !== "" ? String(projetoId) : null;

  await queryClient.invalidateQueries({
    queryKey: id
      ? sgpRiscosQueryKeys.byProjetoInfinite(id)
      : sgpRiscosQueryKeys.byProjetoRoot,
  });
}

/** Query keys das listagens GET de histórico de riscos por projeto */
export const sgpRiscosHistoricoQueryKeys = {
  all: ["sgp-riscos-historico"] as const,
  byProjetoRoot: ["sgp-riscos-historico", "projeto"] as const,
  byProjeto: (projetoId: number | string) =>
    ["sgp-riscos-historico", "projeto", String(projetoId)] as const,
  byProjetoInfinite: (projetoId: number | string) =>
    ["sgp-riscos-historico", "projeto", "infinite", String(projetoId)] as const,
  list: (
    projetoId: number | string,
    per_page?: number | string,
    cursor?: string | null,
  ) =>
    [
      "sgp-riscos-historico",
      "projeto",
      String(projetoId),
      per_page ?? "",
      cursor ?? "",
    ] as const,
  infinite: (projetoId: number | string, perPage?: number) =>
    [
      "sgp-riscos-historico",
      "projeto",
      "infinite",
      String(projetoId),
      perPage ?? 15,
    ] as const,
};

/** Invalida listagens GET de histórico de riscos após mutações futuras */
export async function invalidateSgpRiscosHistoricoQueries(
  queryClient: QueryClient,
  projetoId?: number | string | null,
) {
  const id =
    projetoId != null && String(projetoId) !== "" ? String(projetoId) : null;

  await queryClient.invalidateQueries({
    queryKey: id
      ? sgpRiscosHistoricoQueryKeys.byProjetoInfinite(id)
      : sgpRiscosHistoricoQueryKeys.byProjetoRoot,
  });
}

/** Query keys das listagens GET de usuários autorizados por projeto */
export const sgpUsuariosQueryKeys = {
  all: ["sgp-usuarios"] as const,
  byProjetoRoot: ["sgp-usuarios", "projeto"] as const,
  byProjeto: (projetoId: number | string) =>
    ["sgp-usuarios", "projeto", String(projetoId)] as const,
  byProjetoInfinite: (projetoId: number | string) =>
    ["sgp-usuarios", "projeto", "infinite", String(projetoId)] as const,
  list: (
    projetoId: number | string,
    per_page?: number | string,
    cursor?: string | null,
  ) =>
    [
      "sgp-usuarios",
      "projeto",
      String(projetoId),
      per_page ?? "",
      cursor ?? "",
    ] as const,
  infinite: (projetoId: number | string, perPage?: number) =>
    [
      "sgp-usuarios",
      "projeto",
      "infinite",
      String(projetoId),
      perPage ?? 15,
    ] as const,
};

function resolveProjetoId(
  fromPayload?: number | string | null,
  fromOptions?: number | string | null,
): number | string | null | undefined {
  const id = fromPayload ?? fromOptions;
  return id != null && String(id) !== "" ? id : undefined;
}

/**
 * Invalida listagens GET de stakeholders após create/update/delete.
 * Uma única invalidação por escopo — evita refetch duplicado da mesma query
 * (ex.: prefixo `["sgp-stakes"]` + `["sgp-stakes","projeto","infinite",id]`).
 */
export async function invalidateSgpStakesQueries(
  queryClient: QueryClient,
  projetoId?: number | string | null,
) {
  const id =
    projetoId != null && String(projetoId) !== "" ? String(projetoId) : null;

  await queryClient.invalidateQueries({
    queryKey: id
      ? sgpStakesQueryKeys.byProjetoInfinite(id)
      : sgpStakesQueryKeys.byProjetoRoot,
  });
}

/**
 * Invalida listagens GET de usuários autorizados após create/delete.
 * Mesmo critério de uma invalidação por escopo (ver invalidateSgpStakesQueries).
 */
export async function invalidateSgpUsuariosQueries(
  queryClient: QueryClient,
  projetoId?: number | string | null,
) {
  const id =
    projetoId != null && String(projetoId) !== "" ? String(projetoId) : null;

  await queryClient.invalidateQueries({
    queryKey: id
      ? sgpUsuariosQueryKeys.byProjetoInfinite(id)
      : sgpUsuariosQueryKeys.byProjetoRoot,
  });
}

export { resolveProjetoId };
