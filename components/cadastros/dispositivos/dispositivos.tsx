"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FilterX, Plus, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { DeviceRow } from "@/components/cadastros/types";
import { CadastroFiltrosCard } from "@/components/cadastros/cadastro-filtros-card";
import { CadastroListagemCard } from "@/components/cadastros/cadastro-listagem-card";
import { useDbCadastroList } from "@/hooks/use-db-cadastro-list";
import { listDevicesClient } from "@/services/db-api/list-cadastros";
import { DispositivosModalNovo } from "./dispositivos-modal-novo";
import { DispositivosTabela } from "./dispositivos-tabela";
import { DispositivosTabelaSkeleton } from "./dispositivos-tabela-skeleton";

interface DispositivosProps {
  initialData: DeviceRow[];
  initialSearch: string;
}

export function Dispositivos({ initialData, initialSearch }: DispositivosProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const {
    searchInput,
    setSearchInput,
    rows,
    showTableSkeleton,
    isError,
    error,
  } = useDbCadastroList<DeviceRow>({
    queryKeyPrefix: "db-devices",
    initialData,
    initialSearch,
    fetcher: listDevicesClient,
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
          <h1 className="text-2xl font-bold text-text-primary">Dispositivos</h1>
          <p className="text-sm text-text-secondary">
            Cadastro base de dispositivos compatíveis
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
        fieldLabel="Nome"
        placeholder="Buscar por nome..."
        value={searchInput}
        onChange={setSearchInput}
        inputAriaLabel="Buscar dispositivos"
      />

      <CadastroListagemCard title="Listagem de Dispositivos" icon={Smartphone}>
        {showTableSkeleton ? (
          <DispositivosTabelaSkeleton />
        ) : (
          <DispositivosTabela rows={rows} />
        )}
      </CadastroListagemCard>

      <DispositivosModalNovo open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
