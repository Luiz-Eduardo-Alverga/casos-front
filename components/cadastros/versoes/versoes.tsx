"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FilterX, GitBranch, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { VersionRow } from "@/components/cadastros/types";
import { CadastroFiltrosCard } from "@/components/cadastros/cadastro-filtros-card";
import { CadastroListagemCard } from "@/components/cadastros/cadastro-listagem-card";
import { useDbCadastroList } from "@/hooks/use-db-cadastro-list";
import { listVersionsClient } from "@/services/db-api/list-cadastros";
import { VersoesModalNovo } from "./versoes-modal-novo";
import { VersoesTabela } from "./versoes-tabela";
import { VersoesTabelaSkeleton } from "./versoes-tabela-skeleton";

interface VersoesProps {
  initialData: VersionRow[];
  initialSearch: string;
}

export function Versoes({ initialData, initialSearch }: VersoesProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const {
    searchInput,
    setSearchInput,
    rows,
    showTableSkeleton,
    isError,
    error,
  } = useDbCadastroList<VersionRow>({
    queryKeyPrefix: "db-versions",
    initialData,
    initialSearch,
    fetcher: listVersionsClient,
  });

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message);
    }
  }, [isError, error]);

  const temBuscaAtiva =
    searchInput.trim().length > 0 || initialSearch.trim().length > 0;

  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Versões</h1>
          <p className="text-sm text-text-secondary">
            Cadastro base de versões de produto
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button
            variant="outline"
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            disabled={!temBuscaAtiva}
            onClick={() => setSearchInput("")}
          >
            <FilterX className="h-3.5 w-3.5" />
            Limpar busca
          </Button>
          <Button
            variant="outline"
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            onClick={() => router.push("/painel")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao Painel
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Novo cadastro
          </Button>
        </div>
      </div>

      <CadastroFiltrosCard
        fieldLabel="Nome ou ID"
        placeholder="Buscar por nome ou ID..."
        value={searchInput}
        onChange={setSearchInput}
        inputAriaLabel="Buscar versões"
      />

      <CadastroListagemCard title="Listagem de Versões" icon={GitBranch}>
        {showTableSkeleton ? (
          <VersoesTabelaSkeleton />
        ) : (
          <VersoesTabela rows={rows} />
        )}
      </CadastroListagemCard>

      <VersoesModalNovo open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
