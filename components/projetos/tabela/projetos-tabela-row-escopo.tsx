"use client";

import Link from "next/link";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/badges/status-badge";
import { CategoriaBadge } from "@/components/casos/tabela/categoria-badge";
import { ProjetosTabelaEscopoBadges } from "@/components/projetos/tabela/projetos-tabela-escopo-badges";
import type { ProjetosTabelaEscopoRow } from "@/components/projetos/tabela/projetos-tabela-types";
import { buildCasoHrefForNewTab } from "@/lib/caso-standalone-url";
import { formatMinutesToHHMM } from "@/lib/utils";
import { Box, ExternalLink, SquarePen } from "lucide-react";

export interface ProjetosTabelaRowEscopoProps {
  row: ProjetosTabelaEscopoRow;
}

export function ProjetosTabelaRowEscopo({ row }: ProjetosTabelaRowEscopoProps) {
  const versaoLabel = row.versao
    ? row.versao.toLowerCase().startsWith("v")
      ? row.versao
      : `v${row.versao}`
    : "—";
  const isReport =
    String(row.tipo_abertura ?? "")
      .trim()
      .toUpperCase() === "REPORT";

  return (
    <TableRow className="bg-background border-t border-border-strong hover:bg-muted/30">
      <TableCell className="min-w-[95px] max-w-[120px] py-3 px-5 align-top">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
            #{row.numero}
          </span>
          <CategoriaBadge categoria={row.categoria} />
        </div>
      </TableCell>
      <TableCell className="min-w-0 flex-1 py-3 px-5 align-top">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-semibold leading-snug text-text-primary break-words">
            {row.descricao?.trim() ? row.descricao : "—"}
          </p>
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-text-secondary">
              <Box className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="min-w-0 truncate font-semibold">
                {row.produto || "—"}
              </span>
              <span className="text-text-secondary" aria-hidden>
                •
              </span>
              <span className="shrink-0 whitespace-nowrap font-semibold">
                {versaoLabel}
              </span>
              {isReport ? (
                <>
                  <span className="text-text-secondary" aria-hidden>
                    •
                  </span>
                  <Badge className="bg-secondary font-semibold text-text-primary hover:bg-secondary/80">
                    REPORT
                  </Badge>
                </>
              ) : null}
            </div>
            <ProjetosTabelaEscopoBadges
              showNaoPlanejado={row.showNaoPlanejado}
              showViavel={row.showViavel}
              showDuplicado={row.showDuplicado}
            />
          </div>
        </div>
      </TableCell>
      <TableCell className="w-[88px] py-3 px-5 text-center align-top">
        <div className="flex flex-col gap-0.5 text-xs font-normal text-text-secondary">
          <span>E: {formatMinutesToHHMM(row.estimado_minutos)}</span>
          <span>R: {formatMinutesToHHMM(row.realizado_minutos)}</span>
        </div>
      </TableCell>
      <TableCell className="w-[120px] py-3 px-5 align-top">
        <span className="text-sm font-light text-text-primary line-clamp-2">
          {row.desenvolvedor?.trim() ? row.desenvolvedor : "—"}
        </span>
      </TableCell>
      <TableCell className="w-[123px] py-3 px-5 align-top">
        <StatusBadge status={row.status} />
      </TableCell>
      <TableCell className="w-[66px] py-3 px-5 align-top">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/casos/${row.id}`}
            aria-label={`Editar caso ${row.numero}`}
          >
            <SquarePen className="h-4 w-4 text-emerald-500" />
          </Link>
          <Link
            target="_blank"
            href={buildCasoHrefForNewTab(row.id)}
            aria-label={`Abrir caso ${row.numero} em nova aba`}
          >
            <ExternalLink className="h-4 w-4 text-blue-500" />
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
}
