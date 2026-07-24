"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useStatus } from "@/hooks/catalogos/use-status";
import {
  buildCasosListagemHref,
  resolveVisaoStatusId,
  type VisaoGeralStatusColumn,
} from "@/components/minha-visão/utils";
import type {
  VisaoGeralAgruparPor,
  VisaoGeralItem,
} from "@/services/sprint/get-visao-geral";
import {
  getLabelSortFields,
  getLabelSortOptions,
  VisaoGeralSortableFieldContextMenu,
  VISAO_GERAL_STATUS_SORT_OPTIONS,
  type VisaoGeralSortState,
} from "./visao-geral-sortable-field-context-menu";

interface CasosParaTestarVersoesTableProps {
  data: VisaoGeralItem[];
  agruparPor: VisaoGeralAgruparPor;
}

const STATUS_COLUMNS: Array<{
  key: VisaoGeralStatusColumn;
  label: string;
  getValue: (item: VisaoGeralItem) => number;
  valueClassName: (value: number) => string;
}> = [
  {
    key: "abertos",
    label: "abertos",
    getValue: (item) => item.abertos,
    valueClassName: (value) =>
      value > 0 ? "text-text-primary" : "text-text-secondary",
  },
  {
    key: "aguardando_teste",
    label: "aguard. teste",
    getValue: (item) => item.aguardando_teste,
    valueClassName: (value) =>
      value > 0 ? "text-amber-600" : "text-text-secondary",
  },
  {
    key: "retorno",
    label: "retorno",
    getValue: (item) => item.retorno,
    valueClassName: (value) =>
      value > 0 ? "text-text-primary" : "text-text-secondary",
  },
  {
    key: "suspenso",
    label: "suspenso",
    getValue: (item) => item.suspenso,
    valueClassName: (value) =>
      value > 0 ? "text-red-600" : "text-text-secondary",
  },
  {
    key: "resolvidos",
    label: "resolvidos",
    getValue: (item) => item.resolvidos,
    valueClassName: (value) =>
      value > 0 ? "text-green-600" : "text-text-secondary",
  },
];

function getRowLabels(
  item: VisaoGeralItem,
  agruparPor: VisaoGeralAgruparPor,
): { title: string; subtitle?: string } {
  if (agruparPor === "versao") {
    return {
      title: item.produto,
      subtitle: item.campo ? `v${item.campo}` : undefined,
    };
  }
  if (agruparPor === "produto") {
    return {
      title: item.campo || item.produto,
    };
  }
  if (agruparPor === "projeto") {
    return {
      title: item.campo || "—",
      subtitle: item.produto || undefined,
    };
  }
  return {
    title: item.campo || "—",
    subtitle: item.produto || undefined,
  };
}

function getFooterLabel(count: number, agruparPor: VisaoGeralAgruparPor): string {
  if (agruparPor === "produto") {
    return count === 1
      ? "produto em acompanhamento"
      : "produtos em acompanhamento";
  }
  if (agruparPor === "projeto") {
    return count === 1
      ? "projeto em acompanhamento"
      : "projetos em acompanhamento";
  }
  if (agruparPor === "atribuido_para") {
    return count === 1
      ? "pessoa em acompanhamento"
      : "pessoas em acompanhamento";
  }
  return count === 1
    ? "versão em acompanhamento"
    : "versões em acompanhamento";
}

function compareText(a: string, b: string, direction: number): number {
  return a.localeCompare(b, "pt-BR", { sensitivity: "base" }) * direction;
}

export function CasosParaTestarVersoesTable({
  data,
  agruparPor,
}: CasosParaTestarVersoesTableProps) {
  const { data: statusList } = useStatus();
  const [sort, setSort] = useState<VisaoGeralSortState>({});

  useEffect(() => {
    setSort({});
  }, [agruparPor]);

  const labelSortFields = useMemo(
    () => getLabelSortFields(agruparPor),
    [agruparPor],
  );
  const labelSortOptions = useMemo(
    () => getLabelSortOptions(agruparPor),
    [agruparPor],
  );

  const statusIdByColumn = useMemo(() => {
    const map = {} as Record<VisaoGeralStatusColumn, string | null>;
    for (const column of STATUS_COLUMNS) {
      map[column.key] = resolveVisaoStatusId(column.key, statusList);
    }
    return map;
  }, [statusList]);

  const sortedData = useMemo(() => {
    if (!sort.sort_by || !sort.sort_order) return data;
    const direction = sort.sort_order === "ASC" ? 1 : -1;

    if (sort.sort_by === "produto" || sort.sort_by === "campo") {
      const field = sort.sort_by;
      return [...data].sort((a, b) =>
        compareText(a[field] ?? "", b[field] ?? "", direction),
      );
    }

    const column = STATUS_COLUMNS.find((item) => item.key === sort.sort_by);
    if (!column) return data;
    return [...data].sort(
      (a, b) => (column.getValue(a) - column.getValue(b)) * direction,
    );
  }, [data, sort]);

  const openListagem = useCallback(
    (item: VisaoGeralItem, column: VisaoGeralStatusColumn, value: number) => {
      if (value <= 0) return;
      const statusId = statusIdByColumn[column];
      if (!statusId) return;

      const href = buildCasosListagemHref({
        produtoId: item.produto_id,
        ...(agruparPor === "versao" && item.campo
          ? { versao: item.campo }
          : {}),
        statusId,
      });
      window.open(href, "_blank", "noopener,noreferrer");
    },
    [agruparPor, statusIdByColumn],
  );

  return (
    <div className="flex flex-col">
      <div className="max-h-[420px] overflow-y-auto">
        <Table>
          <TableBody>
            {sortedData.map((item, idx) => {
              const labels = getRowLabels(item, agruparPor);
              return (
                <TableRow
                  key={`${item.produto_id}-${item.campo}-${idx}`}
                  className="bg-card border-b border-border-divider hover:bg-muted/40"
                >
                  <TableCell className="py-1 px-4 align-middle">
                    <VisaoGeralSortableFieldContextMenu
                      sortFields={labelSortFields}
                      sortOptions={labelSortOptions}
                      sort={sort}
                      onSortChange={setSort}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text-primary truncate">
                          {labels.title}
                        </div>
                        {labels.subtitle ? (
                          <div className="text-[11px] text-text-secondary">
                            {labels.subtitle}
                          </div>
                        ) : null}
                      </div>
                    </VisaoGeralSortableFieldContextMenu>
                  </TableCell>
                  {STATUS_COLUMNS.map((column) => {
                    const value = column.getValue(item);
                    const statusId = statusIdByColumn[column.key];
                    const clickable = value > 0 && Boolean(statusId);
                    const content = (
                      <>
                        <span
                          className={cn(
                            "text-sm font-semibold leading-none",
                            column.valueClassName(value),
                          )}
                        >
                          {value}
                        </span>
                        <span className="text-[10px] leading-tight text-text-secondary">
                          {column.label}
                        </span>
                      </>
                    );

                    if (!clickable) {
                      return (
                        <TableCell
                          key={column.key}
                          className="py-1 px-3 text-right align-middle"
                        >
                          <VisaoGeralSortableFieldContextMenu
                            sortField={column.key}
                            sortOptions={VISAO_GERAL_STATUS_SORT_OPTIONS}
                            sort={sort}
                            onSortChange={setSort}
                          >
                            <div className="flex flex-col items-end gap-0.5">
                              {content}
                            </div>
                          </VisaoGeralSortableFieldContextMenu>
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell
                        key={column.key}
                        className="p-0 text-right align-middle"
                      >
                        <VisaoGeralSortableFieldContextMenu
                          sortField={column.key}
                          sortOptions={VISAO_GERAL_STATUS_SORT_OPTIONS}
                          sort={sort}
                          onSortChange={setSort}
                        >
                          <button
                            type="button"
                            className={cn(
                              "flex min-h-12 w-full flex-col items-end justify-center gap-0.5 px-3 py-1",
                              "cursor-pointer hover:bg-muted/50",
                            )}
                            onClick={() =>
                              openListagem(item, column.key, value)
                            }
                          >
                            {content}
                          </button>
                        </VisaoGeralSortableFieldContextMenu>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="px-4 py-2.5 border-t border-border-divider bg-muted/30 text-xs text-text-secondary">
        {data.length} {getFooterLabel(data.length, agruparPor)}
      </div>
    </div>
  );
}
