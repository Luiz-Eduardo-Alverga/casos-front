"use client";

import { useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImportanciaBadge } from "@/components/importancia-badge";
import { Box } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import {
  CasosProdutoSkeleton,
  CasosProdutoSkeletonList,
} from "@/components/painel/casos-produto-skeleton";
import { getUser } from "@/lib/auth";
import { useProjetoMemoria } from "@/hooks/use-projeto-memoria";
import type { ProjetoMemoriaItem } from "@/services/projeto-memoria/get-projeto-memoria";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function formatMinutesToHHMM(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return "00:00";
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function mapItemToCaso(item: ProjetoMemoriaItem) {
  const prioridade = item.caso.caracteristicas.prioridade;

  return {
    id: String(item.caso.id),
    numero: String(item.caso.id),
    versao: item.produto.versao ?? "",
    descricao: item.caso.textos.descricao_resumo ?? "",
    categoria: item.caso.caracteristicas.tipo_categoria ?? "",
    tempoEstimado: formatMinutesToHHMM(item.caso.tempos.estimado_minutos),
    tempoRealizado: formatMinutesToHHMM(item.caso.tempos.realizado_minutos),
    importancia: Number(prioridade) || 0,
    modulo: item.caso.caracteristicas.modulo ?? "",
    statusTempo: item.caso.status.status_tempo ?? "",
  };
}

interface CasosProdutoProps {
  produtoId: string;
  produtoNome: string;
  produtoVersao: string;
}

export function CasosProduto({
  produtoId,
  produtoNome,
  produtoVersao,
}: CasosProdutoProps) {
  const user = getUser();
  const usuarioDevId = user?.id != null ? String(user.id) : "";
  const router = useRouter();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProjetoMemoria(
      {
        per_page: 15,
        usuario_dev_id: usuarioDevId,
        produto_id: produtoId,
        versao_produto: produtoVersao,
        status_id: ["1", "2"],
      },
      { enabled: Boolean(produtoId && produtoVersao && usuarioDevId) },
    );

  const casos = data?.pages.flatMap((p) => p.data.map(mapItemToCaso)) ?? [];
  casos.sort((a, b) =>
    a.statusTempo === "INICIADO" ? -1 : b.statusTempo === "INICIADO" ? 1 : 0,
  );

  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  const hasSelection = Boolean(produtoId && produtoVersao);

  if (hasSelection && isLoading) {
    return <CasosProdutoSkeleton />;
  }

  if (!hasSelection) {
    return (
      <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1 lg:h-full">
        <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
          <div className="flex items-center gap-2">
            <Box className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Casos do Produto
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
          <EmptyState
            imageSrc="/images/empty-state-casos-produto.svg"
            imageAlt="Nenhum produto selecionado"
            icon={Box}
            title="Nenhum produto selecionado"
            description="Selecione um produto na lista ao lado para visualizar os casos."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1 lg:h-full lg:overflow-hidden">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <Box className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Casos do {produtoNome} - Versão {produtoVersao}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
        <div className="flex flex-col gap-4 ">
          {casos.length === 0 ? (
            <EmptyState
              imageSrc="/images/empty-state-casos-produto.svg"
              imageAlt="Nenhum caso encontrado"
              icon={Box}
              title="Nenhum caso encontrado"
              description="Não há casos para este produto e versão no momento."
            />
          ) : (
            casos.map((caso) => (
              <div
                key={caso.id}
                className={cn(
                  "bg-white border border-border-divider rounded-lg p-3.5 flex flex-col gap-0 cursor-pointer hover:bg-muted/50 transition-colors",
                  caso.statusTempo === "INICIADO" &&
                    "border-l-4 border-l-primary",
                )}
                onClick={() => router.push(`/casos/${caso.id}`)}
              >
                <div className="flex gap-3 items-start pb-2 border-b border-border-divider">
                  <ImportanciaBadge
                    importancia={caso.importancia}
                    className="shrink-0"
                  />
                  <div className="flex-1 flex flex-wrap gap-3.75 items-start">
                    <div className="space-x-2">
                      <span className="text-xs font-semibold text-black">
                        Caso #{caso.numero}
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold text-text-secondary leading-5 w-full">
                      {caso.descricao}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2.5">
                  {caso.modulo && (
                    <Badge
                      variant="secondary"
                      className="rounded-full px-4 py-1"
                    >
                      {caso.modulo}
                    </Badge>
                  )}
                  <span className="text-xs font-semibold text-text-secondary ml-auto">
                    E: {caso.tempoEstimado} / R: {caso.tempoRealizado}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        {hasNextPage && casos.length > 0 && (
          <div ref={loadMoreRef} className="mt-4">
            {isFetchingNextPage && <CasosProdutoSkeletonList count={3} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
