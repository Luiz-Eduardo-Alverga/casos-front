"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useProjetoMemoria } from "@/hooks/use-projeto-memoria";
import type { ProjetoMemoriaItem } from "@/services/projeto-memoria/get-projeto-memoria";
import { getUser } from "@/lib/auth";
import { ArrowLeftRight, Box, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/painel/empty-state";
import { CasosTabelaSkeleton } from "@/components/casos/layout/casos-tabela-skeleton";
import { Button } from "@/components/ui/button";
import {
  CasosTabelaTable,
  type CasosTabelaRow,
} from "@/components/casos/tabela/casos-tabela-table";
import { useBulkUpdateCasos } from "@/hooks/use-bulk-update-casos";
import { CasosTransferenciaModal } from "@/components/casos/transferencia/casos-transferencia-modal";
import { buildBulkTransferPayload } from "@/components/casos/transferencia/utils";
import type { CasosTransferenciaFormValues } from "@/components/casos/transferencia/types";

interface CasosTabelaProps {
  filtros: {
    produto: string;
    versao: string;
    modulo: string;
    tipo_categoria: string;
    tipo_abertura: string;
    descricao_resumo: string;
    status_ids: string[];
    projeto_id: string;
    usuario_abertura_id: string;
    usuario_dev_id: string;
    usuario_qa_id: string;
    data_producao_inicio: string;
    data_producao_fim: string;
  };
}

function mapItemToRow(item: ProjetoMemoriaItem): CasosTabelaRow {
  const prioridade = item.caso.caracteristicas.prioridade;

  return {
    id: String(item.caso.id),
    importancia: Number(prioridade) || 0,
    produto: item.produto.nome ?? "",
    versao: item.produto.versao ?? "",
    numero: String(item.caso.id),
    descricao: item.caso.textos.descricao_resumo ?? "",
    status: item.caso.status?.status_tipo ?? "",
    categoria: item.caso.caracteristicas.tipo_categoria ?? "",
    tipo_abertura: item.report?.tipo_abertura ?? "CASO",
    estimado_minutos: item.caso.tempos.estimado_minutos ?? 0,
    realizado_minutos: item.caso.tempos.realizado_minutos ?? 0,
    desenvolvedor: item.caso.usuarios?.desenvolvimento?.nome?.trim() ?? "",
  };
}

export function CasosTabela({ filtros }: CasosTabelaProps) {
  const user = getUser();
  const bulkUpdateCasos = useBulkUpdateCasos();
  // Processar versão (remover sequência se houver)
  const versaoProduto = useMemo(() => {
    if (!filtros.versao) return undefined;
    const part = filtros.versao.split("-")[1]?.trim();
    return part || filtros.versao;
  }, [filtros.versao]);

  // Construir parâmetros para a API
  const projetoMemoriaParams = useMemo(
    () => ({
      per_page: 15,
      ...(filtros.produto ? { produto_id: filtros.produto } : {}),
      ...(versaoProduto ? { versao_produto: versaoProduto } : {}),
      ...(filtros.status_ids.length > 0
        ? { status_id: filtros.status_ids }
        : {}),
      ...(filtros.modulo?.trim() ? { modulo: filtros.modulo.trim() } : {}),
      ...(filtros.tipo_categoria
        ? { tipo_categoria: filtros.tipo_categoria }
        : {}),
      ...(filtros.tipo_abertura?.trim()
        ? {
            tipo_abertura:
              filtros.tipo_abertura.trim() === "CASO" ||
              filtros.tipo_abertura.trim() === "REPORT"
                ? (filtros.tipo_abertura.trim() as "CASO" | "REPORT")
                : undefined,
          }
        : {}),
      ...(filtros.descricao_resumo?.trim()
        ? { descricao_resumo: filtros.descricao_resumo.trim() }
        : {}),
      ...(filtros.projeto_id?.trim()
        ? { projeto_id: filtros.projeto_id.trim() }
        : {}),
      ...(filtros.usuario_abertura_id?.trim()
        ? { usuario_abertura_id: filtros.usuario_abertura_id.trim() }
        : {}),
      ...(filtros.usuario_dev_id?.trim()
        ? { usuario_dev_id: filtros.usuario_dev_id.trim() }
        : {}),
      ...(filtros.usuario_qa_id?.trim()
        ? { usuario_qa_id: filtros.usuario_qa_id.trim() }
        : {}),
      ...(filtros.data_producao_inicio?.trim()
        ? { data_producao_inicio: filtros.data_producao_inicio.trim() }
        : {}),
      ...(filtros.data_producao_fim?.trim()
        ? { data_producao_fim: filtros.data_producao_fim.trim() }
        : {}),
    }),
    [
      filtros.produto,
      versaoProduto,
      filtros.status_ids,
      filtros.modulo,
      filtros.tipo_categoria,
      filtros.tipo_abertura,
      filtros.descricao_resumo,
      filtros.projeto_id,
      filtros.usuario_abertura_id,
      filtros.usuario_dev_id,
      filtros.usuario_qa_id,
      filtros.data_producao_inicio,
      filtros.data_producao_fim,
    ],
  );

  const hasFilters = useMemo(() => {
    if (filtros.status_ids.length > 0) return true;
    if (filtros.usuario_abertura_id?.trim()) return true;
    return (
      !!filtros.produto?.trim() ||
      !!filtros.versao?.trim() ||
      !!filtros.modulo?.trim() ||
      !!filtros.tipo_categoria?.trim() ||
      !!filtros.tipo_abertura?.trim() ||
      !!filtros.descricao_resumo?.trim() ||
      !!filtros.projeto_id?.trim() ||
      !!filtros.usuario_dev_id?.trim() ||
      !!filtros.usuario_qa_id?.trim() ||
      !!filtros.data_producao_inicio?.trim() ||
      !!filtros.data_producao_fim?.trim()
    );
  }, [filtros]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProjetoMemoria(projetoMemoriaParams, {
      enabled: hasFilters,
    });

  const itens = useMemo(
    () => data?.pages.flatMap((p) => p.data.map(mapItemToRow)) ?? [],
    [data],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTransferenciaModalOpen, setIsTransferenciaModalOpen] = useState(false);

  useEffect(() => {
    if (itens.length === 0) {
      setSelectedIds([]);
      return;
    }
    const idsAtuais = new Set(itens.map((item) => item.id));
    setSelectedIds((prev) => prev.filter((id) => idsAtuais.has(id)));
  }, [itens]);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleToggleItem = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }
      return prev.filter((selectedId) => selectedId !== id);
    });
  };

  const handleToggleAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(itens.map((item) => item.id));
  };

  const handleTransferirCasos = async (values: CasosTransferenciaFormValues) => {
    const idsSelecionados = selectedIds;
    if (idsSelecionados.length === 0) {
      toast.error("Selecione ao menos um caso para transferir.");
      return;
    }

    const payload = buildBulkTransferPayload(idsSelecionados, values);
    if (!payload) {
      toast.error("Preencha ao menos um campo para transferir.");
      return;
    }

    await bulkUpdateCasos.mutateAsync(payload);
    toast.success("Casos transferidos com sucesso.");
    setSelectedIds([]);
    setIsTransferenciaModalOpen(false);
  };

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(
        typeof window !== "undefined" && window.scrollY >= window.innerHeight,
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col">
      <CardHeader className="p-4 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Box className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Listagem de Casos
            </CardTitle>
          </div>

          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsTransferenciaModalOpen(true)}
              disabled={selectedIds.length === 0}
            >
              <ArrowLeftRight className="h-3.5 w-3.5 text-text-primary" />
              {selectedIds.length > 0
                ? `Transferir casos (${selectedIds.length})`
                : "Transferir casos"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        {!hasFilters ? (
          <EmptyState
            imageSrc="/images/empty-state-casos-produto.svg"
            imageAlt="Nenhum filtro aplicado"
            icon={Box}
            title="Nenhum filtro aplicado"
            description="Selecione os filtros e clique em 'Filtrar' para visualizar os casos."
            className="w-42 h-42"
          />
        ) : isLoading ? (
          <CasosTabelaSkeleton />
        ) : itens.length === 0 ? (
          <EmptyState
            imageSrc="/images/empty-state-casos-produto.svg"
            imageAlt="Nenhum caso encontrado"
            icon={Box}
            title="Nenhum caso encontrado"
            description="Ajuste os filtros ou não há casos que correspondam aos critérios."
            className="w-42 h-42"
          />
        ) : (
          <>
            <CasosTabelaTable
              itens={itens}
              isFetchingNextPage={isFetchingNextPage}
              selectedIds={selectedIds}
              onToggleItem={handleToggleItem}
              onToggleAll={handleToggleAll}
            />
            {hasNextPage && itens.length > 0 && (
              <div ref={loadMoreRef} className="mt-4 min-h-[48px]" />
            )}
          </>
        )}
      </CardContent>
      {showScrollTop && (
        <Button
          type="button"
          size="icon"
          className="fixed bottom-6 right-6 h-10 w-10 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 z-50"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Voltar ao topo"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}

      <CasosTransferenciaModal
        open={isTransferenciaModalOpen}
        onOpenChange={setIsTransferenciaModalOpen}
        totalSelecionados={selectedIds.length}
        produtoIdPadrao={filtros.produto}
        isSubmitting={bulkUpdateCasos.isPending}
        onSubmit={handleTransferirCasos}
      />
    </Card>
  );
}
