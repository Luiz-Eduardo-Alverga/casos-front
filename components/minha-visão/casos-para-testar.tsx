"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/painel/empty-state";
import { CasosParaTestarSkeleton } from "@/components/minha-visão/casos-para-testar-skeleton";
import {
  CasosParaTestarBadges,
  STATUS_BADGE_CLASSES,
} from "@/components/minha-visão/casos-para-testar-badges";
import type { AgendaDevItem } from "@/services/auxiliar/get-agenda-dev";
import { cn } from "@/lib/utils";

export interface ProdutoAgrupado {
  produto: string;
  totalAbertos: number;
  totalCorrigidos: number;
  totalRetornos: number;
  totalSuspenso: number;
  totalResolvidos: number;
  versoes: {
    versao: string;
    abertos: number;
    corrigidos: number;
    retornos: number;
    suspenso: number;
    resolvidos: number;
  }[];
}

function groupAgendaByProduto(items: AgendaDevItem[]): ProdutoAgrupado[] {
  const map = new Map<
    string,
    {
      produto: string;
      totalAbertos: number;
      totalCorrigidos: number;
      totalRetornos: number;
      totalSuspenso: number;
      totalResolvidos: number;
      versoes: ProdutoAgrupado["versoes"];
    }
  >();

  for (const item of items) {
    const nome = item.produto;
    const abertos = parseInt(item.abertos, 10) || 0;
    const corrigidos = parseInt(item.corrigidos, 10) || 0;
    const retornos = parseInt(item.retornos, 10) || 0;
    const resolvidos = parseInt(item.resolvidos, 10) || 0;
    const suspenso = 0; // API não retorna suspenso por enquanto

    const existing = map.get(nome);
    if (existing) {
      existing.totalAbertos += abertos;
      existing.totalCorrigidos += corrigidos;
      existing.totalRetornos += retornos;
      existing.totalSuspenso += suspenso;
      existing.totalResolvidos += resolvidos;
      existing.versoes.push({
        versao: item.versao ?? "",
        abertos,
        corrigidos,
        retornos,
        suspenso,
        resolvidos,
      });
    } else {
      map.set(nome, {
        produto: nome,
        totalAbertos: abertos,
        totalCorrigidos: corrigidos,
        totalRetornos: retornos,
        totalSuspenso: suspenso,
        totalResolvidos: resolvidos,
        versoes: [
          {
            versao: item.versao ?? "",
            abertos,
            corrigidos,
            retornos,
            suspenso,
            resolvidos,
          },
        ],
      });
    }
  }

  return Array.from(map.values());
}

interface CasosParaTestarProps {
  agendaData: AgendaDevItem[];
  isLoading?: boolean;
}

export function CasosParaTestar({
  agendaData,
  isLoading = false,
}: CasosParaTestarProps) {
  const produtos = useMemo(
    () => groupAgendaByProduto(agendaData ?? []),
    [agendaData],
  );

  if (isLoading) {
    return <CasosParaTestarSkeleton />;
  }

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Casos Para Testar
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
        {produtos.length === 0 ? (
          <EmptyState
            imageSrc="/images/empty-state-produtos-priorizados.svg"
            imageAlt="Nenhum caso para testar"
            icon={FileText}
            title="Nenhum caso para testar"
            description="Não há produtos ou versões com casos para testar no momento."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {produtos.map((p) => (
              <ProdutoCollapsibleRow key={p.produto} produto={p} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ProdutoCollapsibleRowProps {
  produto: ProdutoAgrupado;
}

function ProdutoCollapsibleRow({ produto }: ProdutoCollapsibleRowProps) {
  const [open, setOpen] = useState(false);
  const versoesCount = produto.versoes.length;
  const versoesLabel =
    versoesCount === 1 ? "1 Versão" : `${versoesCount} versões`;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="bg-white border border-border-divider rounded-lg overflow-hidden"
    >
      <CollapsibleTrigger
        className={cn(
          "w-full flex flex-wrap items-center gap-2 p-5  text-left hover:bg-muted/30 transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-lg",
        )}
        aria-expanded={open}
      >
        <div className="flex shrink-0 text-text-primary order-first">
          {open ? (
            <ChevronUp className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden />
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5 order-2">
          <span className="text-sm font-semibold text-text-primary truncate">
            {produto.produto}
          </span>
          <span className="text-xs text-text-secondary">{versoesLabel}</span>
        </div>
        <div className="w-full sm:w-auto shrink-0 order-3 sm:order-3">
          <CasosParaTestarBadges
            abertos={produto.totalAbertos}
            corrigidos={produto.totalCorrigidos}
            retornos={produto.totalRetornos}
            suspenso={produto.totalSuspenso}
            resolvidos={produto.totalResolvidos}
            showLabels={true}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t border-border-divider p-5 pt-3">
          <Table>
            <TableHeader>
              <TableRow className="bg-white border-b border-white hover:bg-white">
                <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                  Versão
                </TableHead>
                <TableHead className="text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                  Abertos
                </TableHead>
                <TableHead className="text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                  Corrigido
                </TableHead>
                <TableHead className="text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                  Retorno
                </TableHead>
                <TableHead className="text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                  Suspenso
                </TableHead>
                <TableHead className="text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                  Resolvidos
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produto.versoes.map((v, idx) => (
                <TableRow
                  key={`${v.versao}-${idx}`}
                  className="bg-white border-t border-border-divider hover:bg-white"
                >
                  <TableCell className="py-3 px-2.5">
                    <span className="text-xs font-semibold text-text-primary">
                      {v.versao || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-2.5">
                    <div className="flex justify-center">
                      <Badge
                        className={cn(
                          "rounded-full w-9 h-7 flex items-center justify-center font-semibold text-xs",
                          STATUS_BADGE_CLASSES.abertos,
                        )}
                      >
                        {v.abertos}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-2.5">
                    <div className="flex justify-center">
                      <Badge
                        className={cn(
                          "rounded-full w-9 h-7 flex items-center justify-center font-semibold text-xs",
                          STATUS_BADGE_CLASSES.corrigido,
                        )}
                      >
                        {v.corrigidos}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-2.5">
                    <div className="flex justify-center">
                      <Badge
                        className={cn(
                          "rounded-full w-9 h-7 flex items-center justify-center font-semibold text-xs",
                          STATUS_BADGE_CLASSES.retorno,
                        )}
                      >
                        {v.retornos}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-2.5">
                    <div className="flex justify-center">
                      <Badge
                        className={cn(
                          "rounded-full w-9 h-7 flex items-center justify-center font-semibold text-xs",
                          STATUS_BADGE_CLASSES.suspenso,
                        )}
                      >
                        {v.suspenso}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-2.5">
                    <div className="flex justify-center">
                      <Badge
                        className={cn(
                          "rounded-full w-9 h-7 flex items-center justify-center font-semibold text-xs",
                          STATUS_BADGE_CLASSES.resolvidos,
                        )}
                      >
                        {v.resolvidos}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
