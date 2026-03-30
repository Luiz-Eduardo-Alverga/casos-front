"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { ImportanciaBadge } from "@/components/importancia-badge";
import { useProjetoMemoria } from "@/hooks/use-projeto-memoria";
import type { ProjetoMemoriaItem } from "@/services/projeto-memoria/get-projeto-memoria";
import { getUser } from "@/lib/auth";
import { Box, ChevronUp } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import {
  CasosTabelaSkeleton,
  CasosTabelaSkeletonRows,
} from "@/components/casos/casos-tabela-skeleton";
import { Button } from "@/components/ui/button";

interface CasosTabelaProps {
  filtros: {
    produto: string;
    versao: string;
    modulo: string;
    tipo_categoria: string;
    descricao_resumo: string;
    status_ids: string[];
    usuario_abertura_id: string;
    usuario_dev_id: string;
    usuario_qa_id: string;
    data_producao_inicio: string;
    data_producao_fim: string;
  };
}

function formatMinutesToHHMM(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return "00:00";
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Função para obter cores do badge de categoria
function getCategoriaBadgeStyles(categoria: string) {
  const categoriaUpper = categoria?.toUpperCase() || "";

  if (categoriaUpper.includes("MELHORIA")) {
    return "bg-purple-100 text-purple-700";
  }
  if (categoriaUpper.includes("BUG")) {
    return "bg-red-100 text-red-700";
  }
  if (categoriaUpper.includes("REQUISITO")) {
    return "bg-blue-100 text-blue-700";
  }
  // Default
  return "bg-gray-100 text-gray-700";
}

function mapItemToRow(item: ProjetoMemoriaItem) {
  const prioridade = item.caso.caracteristicas.prioridade;
  return {
    id: String(item.caso.id),
    importancia: Number(prioridade) || 0,
    produto: item.produto.nome ?? "",
    versao: item.produto.versao ?? "",
    numero: String(item.caso.id),
    descricao: item.caso.textos.descricao_resumo ?? "",
    status: item.caso.status?.descricao ?? "",
    categoria: item.caso.caracteristicas.tipo_categoria ?? "",
    modulo: item.caso.caracteristicas.modulo ?? "",
    tempoEstimado: formatMinutesToHHMM(item.caso.tempos.estimado_minutos),
    tempoRealizado: formatMinutesToHHMM(item.caso.tempos.realizado_minutos),
  };
}

export function CasosTabela({ filtros }: CasosTabelaProps) {
  const router = useRouter();
  const user = getUser();
  const usuarioDevId = user?.id != null ? String(user.id) : "";

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
      ...(filtros.descricao_resumo?.trim()
        ? { descricao_resumo: filtros.descricao_resumo.trim() }
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
      filtros.descricao_resumo,
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
      !!filtros.descricao_resumo?.trim()
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

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Box className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Listagem de Casos
            </CardTitle>
          </div>

          {/* <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">
              Total de casos: {totalItens}
            </span>
          </div> */}
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
            <Table>
              <TableHeader>
                <TableRow className="bg-white border-b border-white hover:bg-white">
                  <TableHead className="w-[60px] font-medium text-sm text-text-primary h-auto py-4 px-5">
                    Registro
                  </TableHead>
                  <TableHead className="w-[100px] text-center font-medium text-sm text-text-primary h-auto py-4 px-5">
                    Categoria
                  </TableHead>
                  <TableHead className="w-[200px] font-medium text-sm text-text-primary h-auto py-4 px-5">
                    Produto
                  </TableHead>
                  <TableHead className="flex-1 font-medium text-sm text-text-primary h-auto py-4 px-5">
                    Resumo
                  </TableHead>
                  <TableHead className="w-[100px] text-center font-medium text-sm text-text-primary h-auto py-4 px-5">
                    Importância
                  </TableHead>
                  <TableHead className="w-[150px] font-medium text-sm text-text-primary h-auto py-4 px-5">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((row) => (
                  <TableRow
                    key={row.id}
                    className="bg-white border-t border-[#e0e0e0] hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/casos/${row.id}`)}
                  >
                    <TableCell className="w-[60px] py-3 px-5">
                      <span className="text-base font-light text-[#1d1d1d] whitespace-nowrap">
                        #{row.numero}
                      </span>
                    </TableCell>
                    <TableCell className="w-[100px] py-3 px-5">
                      <div className="flex justify-center">
                        <Badge
                          className={`${getCategoriaBadgeStyles(
                            row.categoria,
                          )} border-transparent rounded-full h-7 px-2.5 flex items-center justify-center`}
                        >
                          <span className="text-xs font-semibold">
                            {row.categoria || "—"}
                          </span>
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="w-[200px] py-3 px-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-light text-[#1d1d1d]">
                          {row.produto}
                        </span>
                        <span className="text-xs font-light text-[#1d1d1d]">
                          {row.versao}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="flex-1 py-3 px-5">
                      <span className="text-sm font-light text-[#1d1d1d]">
                        {row.descricao || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="w-[100px] py-3 px-5">
                      <div className="flex justify-center">
                        <ImportanciaBadge importancia={row.importancia} />
                      </div>
                    </TableCell>
                    <TableCell className="w-[150px] py-3 px-5">
                      <StatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {isFetchingNextPage && <CasosTabelaSkeletonRows count={3} />}
              </TableBody>
            </Table>
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
    </Card>
  );
}
