"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/painel/empty-state";
import { CadastroFiltrosCard } from "@/components/cadastros/cadastro-filtros-card";
import { CadastroListagemCard } from "@/components/cadastros/cadastro-listagem-card";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { useDebouncedValue } from "@/hooks/shared/use-debounced-value";
import { useClientes } from "@/hooks/catalogos/use-clientes";
import { ClientesTable } from "./clientes-table";
import { ClientesTableSkeleton } from "./clientes-table-skeleton";
import type { ClienteListItem } from "./types";

const DEBOUNCE_MS = 300;

export function Clientes() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("search") ?? "",
  );

  const debouncedSearch = useDebouncedValue(searchInput, DEBOUNCE_MS);
  const hasSearch = debouncedSearch.trim().length > 0;
  const urlSearch = searchParams.get("search") ?? "";

  useEffect(() => {
    if (urlSearch && !searchInput.trim()) {
      setSearchInput(urlSearch);
    }
  }, [urlSearch, searchInput]);

  const clientesQuery = useClientes(
    { search: debouncedSearch.trim(), per_page: 50 },
    { enabled: hasSearch },
  );

  const rows = useMemo<ClienteListItem[]>(
    () => clientesQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [clientesQuery.data],
  );

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasNextPage = clientesQuery.hasNextPage;
  const isFetchingNextPage = clientesQuery.isFetchingNextPage;
  const fetchNextPage = clientesQuery.fetchNextPage;

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasSearch || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "100px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasSearch, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const params = new URLSearchParams();
    const term = searchInput.trim();
    if (term) params.set("search", term);
    const qs = params.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    window.history.replaceState(null, "", next);
  }, [searchInput, pathname]);

  useEffect(() => {
    if (clientesQuery.isError && clientesQuery.error) {
      toast.error(clientesQuery.error.message);
    }
  }, [clientesQuery.isError, clientesQuery.error]);

  const showTableSkeleton = hasSearch && clientesQuery.isLoading;

  return (
    <ListagemPageLayout
      title="Clientes"
      subtitle="Consulte e visualize os clientes cadastrados"
    >
      <CadastroFiltrosCard
        fieldLabel="Buscar"
        placeholder="Nome ou razão social..."
        value={searchInput}
        onChange={setSearchInput}
        inputAriaLabel="Buscar cliente"
      />

      <CadastroListagemCard
        title="Listagem de Clientes"
        icon={Building2}
        showTotalRecords={hasSearch}
        totalRecords={rows.length}
        totalRecordsUnit={{ singular: "cliente", plural: "clientes" }}
      >
        {!hasSearch ? (
          <EmptyState
            icon={Building2}
            title="Busque um cliente"
            description="Digite no campo acima para localizar clientes por nome ou razão social."
            className="min-h-[260px]"
          />
        ) : showTableSkeleton ? (
          <ClientesTableSkeleton />
        ) : (
          <>
            <ClientesTable
              rows={rows}
              isFetchingNextPage={isFetchingNextPage}
            />
            <div ref={loadMoreRef} className="mt-4 min-h-[48px]" />
          </>
        )}
      </CadastroListagemCard>
    </ListagemPageLayout>
  );
}
