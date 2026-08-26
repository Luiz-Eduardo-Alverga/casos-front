"use client";

import { useCallback, useEffect, useState } from "react";
import type { DocFilters, DocStatus } from "@/services/db-api/docs";

const FILTER_KEYS = ["search", "categoryId", "status", "sector", "tag"] as const;
const DOC_STATUSES = new Set<DocStatus>([
  "rascunho",
  "publicado",
  "desatualizado",
]);

function readFilters(): DocFilters {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");
  return {
    search: params.get("search") || undefined,
    categoryId: params.get("categoryId") || undefined,
    status:
      status && DOC_STATUSES.has(status as DocStatus)
        ? (status as DocStatus)
        : undefined,
    sector: params.get("sector") || undefined,
    tag: params.get("tag") || undefined,
  };
}

function replaceQuery(filters: DocFilters) {
  const params = new URLSearchParams(window.location.search);
  for (const key of FILTER_KEYS) {
    const value = filters[key];
    if (value) params.set(key, String(value));
    else params.delete(key);
  }
  const query = params.toString();
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}`,
  );
}

export function useDocsFiltros() {
  const [filtros, setFiltrosState] = useState<DocFilters>({});

  useEffect(() => {
    setFiltrosState(readFilters());
    const onPopState = () => setFiltrosState(readFilters());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setFiltros = useCallback((next: DocFilters) => {
    setFiltrosState(next);
    replaceQuery(next);
  }, []);

  const setFiltro = useCallback(
    <K extends keyof DocFilters>(key: K, value: DocFilters[K]) => {
      setFiltrosState((current) => {
        const next = { ...current, [key]: value || undefined };
        replaceQuery(next);
        return next;
      });
    },
    [],
  );

  const limparFiltros = useCallback(() => setFiltros({}), [setFiltros]);

  return { filtros, setFiltros, setFiltro, limparFiltros };
}
