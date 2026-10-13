"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { LiberacoesFiltros } from "@/components/liberacoes/filtros/liberacoes-filtros";
import { LiberacoesTabela } from "@/components/liberacoes/liberacoes-tabela";
import { LiberacaoCreateModal } from "@/components/liberacoes/cadastro/liberacao-create-modal";
import { useLiberacoesFiltros } from "@/hooks/liberacoes/use-liberacoes-filtros";
import { useLiberacaoPermissoes } from "@/hooks/liberacoes/use-liberacao-permissoes";

export function Liberacoes() {
  const router = useRouter();
  const { filtros, setFiltro, limparFiltros } = useLiberacoesFiltros();
  const { canCreate } = useLiberacaoPermissoes();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <ListagemPageLayout
      title="Registro de Liberação"
      subtitle="Acompanhe versões piloto, versão final e casos vinculados por produto."
      actions={
        canCreate ? (
          <Button
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Nova liberação
          </Button>
        ) : null
      }
    >
      <LiberacoesFiltros
        filtros={filtros}
        onFiltroChange={setFiltro}
        onLimpar={limparFiltros}
      />
      <LiberacoesTabela filtros={filtros} />

      {canCreate ? (
        <LiberacaoCreateModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={(registro) => router.push(`/liberacoes/${registro}`)}
        />
      ) : null}
    </ListagemPageLayout>
  );
}
