"use client";

import Link from "next/link";
import { ExternalLink, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/painel/empty-state";
import { cn } from "@/lib/utils";
import { PainelIdeiasSkeleton } from "./painel-ideias-skeleton";
import { toDateInputValue } from "@/components/melhorias/filtros/melhorias-filtros-mappers";
import type { VisaoPainelIdeiasItem } from "@/services/sprint/get-visao-painel-ideias";

interface PainelIdeiasProps {
  data: VisaoPainelIdeiasItem[];
  total: number;
  isLoading?: boolean;
  /** Setor ativo nos filtros da Minha Visão (nome), repassado no drill-down. */
  setor?: string;
}

/**
 * Período do mês da competência ("2026/09" → 2026-09-01 a 2026-09-30).
 * A API agrupa por competência; dt_inicial/dt_final vêm como uma data solta
 * (ou null) e não representam o mês, por isso não servem de período.
 */
function competenciaToPeriodo(
  competencia: string | null | undefined,
): { dataInicial: string; dataFinal: string } | null {
  const match = /^(\d{4})\D(\d{1,2})$/.exec(String(competencia ?? "").trim());
  if (!match) return null;
  const ano = Number(match[1]);
  const mes = Number(match[2]);
  if (mes < 1 || mes > 12) return null;
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const mm = String(mes).padStart(2, "0");
  return {
    dataInicial: `${ano}-${mm}-01`,
    dataFinal: `${ano}-${mm}-${String(ultimoDia).padStart(2, "0")}`,
  };
}

function buildMelhoriasHref(
  item: VisaoPainelIdeiasItem,
  setor?: string,
): string {
  const params = new URLSearchParams();
  if (item.produto_id != null) {
    params.set("produtoId", String(item.produto_id));
  }
  const periodo = competenciaToPeriodo(item.competencia);
  const dataInicial = periodo?.dataInicial ?? toDateInputValue(item.dt_inicial);
  if (dataInicial) params.set("dataInicial", dataInicial);
  const dataFinal = periodo?.dataFinal ?? toDateInputValue(item.dt_final);
  if (dataFinal) params.set("dataFinal", dataFinal);
  if (setor?.trim()) params.set("setor", setor.trim());

  const qs = params.toString();
  return qs ? `/melhorias?${qs}` : "/melhorias";
}

export function PainelIdeias({
  data,
  total,
  isLoading = false,
  setor,
}: PainelIdeiasProps) {
  if (isLoading) {
    return <PainelIdeiasSkeleton />;
  }

  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="p-4 pb-2 border-b border-border-divider flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Painel de ideias & feedback
          </CardTitle>
        </div>
        <span className="text-[11px] font-semibold text-amber-600">
          {total} {total === 1 ? "registro" : "registros"}
        </span>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <EmptyState
            title="Nenhuma ideia registrada"
            description="Não há ideias ou feedbacks com os filtros selecionados."
            className="py-8"
          />
        ) : (
          <div className="max-h-[220px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-card border-b border-border-divider hover:bg-card">
                  <TableHead className="sticky top-0 z-10 bg-card py-2 px-4 text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                    Mês
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card py-2 px-2.5 text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                    Produto
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card py-2 px-2.5 text-[11px] font-medium uppercase tracking-wide text-text-secondary text-right">
                    Pend.
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card py-2 px-2.5 text-[11px] font-medium uppercase tracking-wide text-text-secondary text-right">
                    Aprov.
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 w-8 bg-card py-2 pl-0 pr-4">
                    <span className="sr-only">Abrir</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, idx) => {
                  const href = buildMelhoriasHref(item, setor);
                  return (
                  <TableRow
                    key={`${item.produto_id}-${item.competencia}-${idx}`}
                    className="group bg-card border-b border-border-divider transition-colors hover:bg-muted cursor-pointer"
                    onClick={() =>
                      window.open(href, "_blank", "noopener,noreferrer")
                    }
                  >
                    <TableCell className="py-2 px-4 text-[11px] text-text-secondary">
                      {item.competencia}
                    </TableCell>
                    <TableCell className="py-2 px-2.5 text-xs font-medium text-text-primary">
                      {item.produto}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "py-2 px-2.5 text-right text-xs font-semibold",
                        item.pendente > 0
                          ? "text-amber-600"
                          : "text-text-secondary",
                      )}
                    >
                      {item.pendente}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "py-2 px-2.5 text-right text-xs font-semibold",
                        item.aprovado > 0
                          ? "text-green-600"
                          : "text-text-secondary",
                      )}
                    >
                      {item.aprovado}
                    </TableCell>
                    <TableCell className="w-8 py-2 pl-0 pr-4 text-right">
                      <Link
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        // A linha já abre a aba; o link existe para teclado e leitor de tela.
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Abrir melhorias de ${item.produto} (${item.competencia}) em nova aba`}
                        className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <ExternalLink
                          className="h-3.5 w-3.5 text-text-secondary opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                          aria-hidden
                        />
                      </Link>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { PainelIdeiasSkeleton } from "./painel-ideias-skeleton";
