"use client";

import type { ReactNode } from "react";
import { Box } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { CategoriaBadge } from "@/components/casos/tabela/categoria-badge";
import { formatLiberacaoDateDisplay } from "@/components/liberacoes/utils";
import type { PainelIdeiaItem } from "@/services/painel-ideias/get-painel-ideias";

export interface MelhoriasTabelaRowProps {
  item: PainelIdeiaItem;
}

function MetaChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-border-divider bg-muted/90 px-1.5 py-0 text-[10px] font-semibold text-text-secondary">
      {children}
    </span>
  );
}

function MetaSeparator() {
  return (
    <span className="text-text-secondary" aria-hidden>
      •
    </span>
  );
}

/**
 * Normaliza SIM/NÃO/null da API para exibição.
 * `null` ou vazio → "NÃO"; demais valores mantêm o texto (ex.: "SIM", "NÃO").
 */
function displaySituacaoValue(value: string | null | undefined): string {
  if (value == null) return "NÃO";
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : "NÃO";
}

export function MelhoriasTabelaRow({ item }: MelhoriasTabelaRowProps) {
  const descricao =
    item.descricao_resumo_tratada?.trim() ||
    item.descricao_resumo?.trim() ||
    item.descricao?.trim() ||
    "—";
  const dataLabel = formatLiberacaoDateDisplay(item.datas);
  const suporte = item.nome_suporte?.trim() || "—";
  const casoLabel =
    item.numero_caso != null ? `Caso #${item.numero_caso}` : null;
  const importancia = item.importancia?.trim() || "";
  const aprovado = displaySituacaoValue(item.status);
  const concluido = displaySituacaoValue(item.concluido);

  return (
    <TableRow className="bg-background border-t border-border-strong hover:bg-muted/30">
      <TableCell className="min-w-[95px] max-w-[120px] py-3 px-2 align-top">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
            #{item.registro}
          </span>
          {item.tipo?.trim() ? (
            <CategoriaBadge categoria={item.tipo} />
          ) : null}
        </div>
      </TableCell>

      <TableCell className="min-w-0 flex-1 py-3 px-2 align-top">
        <div className="flex min-w-0 flex-col gap-1">
          <p
            className="text-sm font-semibold leading-snug text-text-primary break-words line-clamp-2"
            title={descricao}
          >
            {descricao}
          </p>
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-text-secondary">
            <Box className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="min-w-0 truncate font-semibold">
              {item.produto?.trim() || "—"}
            </span>
            <MetaSeparator />
            <span className="shrink-0 whitespace-nowrap font-semibold">
              {dataLabel}
            </span>
            <MetaSeparator />
            <span className="shrink-0 whitespace-nowrap font-semibold">
              Aberto por {suporte}
            </span>
            {casoLabel ? (
              <>
                <MetaSeparator />
                <span className="shrink-0 whitespace-nowrap font-semibold">
                  {casoLabel}
                </span>
              </>
            ) : null}
            {importancia ? (
              <MetaChip>Importância: {importancia}</MetaChip>
            ) : null}
          </div>
        </div>
      </TableCell>

      <TableCell className="min-w-[140px] w-[160px] py-3 px-2 align-top">
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs font-semibold text-text-secondary whitespace-nowrap">
            Aprovado: {aprovado}
          </span>
          <span className="text-xs font-semibold text-text-secondary whitespace-nowrap">
            Concluído: {concluido}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}
