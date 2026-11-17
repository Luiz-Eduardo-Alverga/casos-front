"use client";

import { useRouter } from "next/navigation";
import { Lightbulb } from "lucide-react";
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

function buildMelhoriasHref(
  item: VisaoPainelIdeiasItem,
  setor?: string,
): string {
  const params = new URLSearchParams();
  if (item.produto_id != null) {
    params.set("produtoId", String(item.produto_id));
  }
  const dataInicial = toDateInputValue(item.dt_inicial);
  if (dataInicial) params.set("dataInicial", dataInicial);
  const dataFinal = toDateInputValue(item.dt_final);
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
  const router = useRouter();

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
                  <TableHead className="sticky top-0 z-10 bg-card py-2 px-4 text-[11px] font-medium uppercase tracking-wide text-text-secondary text-right">
                    Aprov.
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, idx) => (
                  <TableRow
                    key={`${item.produto_id}-${item.competencia}-${idx}`}
                    className="bg-card border-b border-border-divider hover:bg-muted/40 cursor-pointer"
                    onClick={() => router.push(buildMelhoriasHref(item, setor))}
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
                        "py-2 px-4 text-right text-xs font-semibold",
                        item.aprovado > 0
                          ? "text-green-600"
                          : "text-text-secondary",
                      )}
                    >
                      {item.aprovado}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { PainelIdeiasSkeleton } from "./painel-ideias-skeleton";
