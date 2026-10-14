"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { getPrioridadeStyle } from "../utils";
import type { ReportsFiltrosLocais } from "../hooks/use-reports-filtros-locais";
import {
  REPORT_CRITICIDADE_LABEL,
  REPORT_CRITICIDADES,
} from "./reports-filtros-locais";
import { ReportsFiltroChip } from "./reports-filtro-chip";

const PRODUTOS_VISIVEIS = 8;
const PRODUTOS_COM_BUSCA = 10;

const PRAZO_CHIPS = [
  { id: "vencido" as const, label: "Vencidos", dotClassName: "bg-red-500" },
  {
    id: "noprazo" as const,
    label: "Não vencidos",
    dotClassName: "bg-muted-foreground",
  },
];

interface ReportsFiltroLocaisProps {
  locais: ReportsFiltrosLocais;
  carregado: boolean;
}

export function ReportsFiltroLocais({
  locais,
  carregado,
}: ReportsFiltroLocaisProps) {
  return (
    <div className="-mx-6 mt-6 flex flex-col gap-4 border-t border-border-divider px-6 pt-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-sm font-medium text-text-label">
              Criticidade
            </Label>
            <span className="text-xs text-text-secondary">
              pode marcar mais de uma
            </span>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Criticidade">
            {REPORT_CRITICIDADES.map((key) => {
              const count = locais.contagemCriticidade[key];
              return (
                <ReportsFiltroChip
                  key={key}
                  pressed={locais.criticidades.includes(key)}
                  label={REPORT_CRITICIDADE_LABEL[key]}
                  dotClassName={getPrioridadeStyle(REPORT_CRITICIDADE_LABEL[key]).badgeDot}
                  count={carregado ? count : undefined}
                  zero={carregado && count === 0}
                  onClick={() => locais.toggleCriticidade(key)}
                />
              );
            })}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <Label className="text-sm font-medium text-text-label">Prazo</Label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Prazo">
            {PRAZO_CHIPS.map((chip) => {
              const count = locais.contagemPrazo[chip.id];
              return (
                <ReportsFiltroChip
                  key={chip.id}
                  pressed={locais.prazo === chip.id}
                  label={chip.label}
                  dotClassName={chip.dotClassName}
                  count={carregado ? count : undefined}
                  zero={carregado && count === 0}
                  onClick={() => locais.togglePrazo(chip.id)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <ReportsFiltroProdutos locais={locais} carregado={carregado} />
    </div>
  );
}

function ReportsFiltroProdutos({
  locais,
  carregado,
}: ReportsFiltroLocaisProps) {
  const [busca, setBusca] = useState("");
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const total = locais.produtos.length;
  const muitos = total > PRODUTOS_COM_BUSCA;
  const termo = busca.trim().toLowerCase();

  const visiveis = useMemo(() => {
    const lista = locais.produtos;
    if (muitos && termo) {
      return lista.filter(
        (produto) =>
          produto.nome.toLowerCase().includes(termo) ||
          locais.produtoIds.includes(produto.id),
      );
    }

    if (!muitos || mostrarTodos) return lista;

    const shown = lista.slice(0, PRODUTOS_VISIVEIS);
    const shownIds = new Set(shown.map((produto) => produto.id));
    for (const produto of lista) {
      if (locais.produtoIds.includes(produto.id) && !shownIds.has(produto.id)) {
        shown.push(produto);
        shownIds.add(produto.id);
      }
    }
    return shown;
  }, [locais.produtos, locais.produtoIds, muitos, mostrarTodos, termo]);

  const ocultos = muitos && !mostrarTodos && !termo ? total - visiveis.length : 0;

  return (
    <div className="flex flex-col gap-2 border-t border-border-divider pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-text-label">Produto</span>
        {carregado && total > 0 ? (
          <span className="text-xs text-text-secondary">
            · {total} {total > 1 ? "produtos" : "produto"} com reports
          </span>
        ) : null}
        {muitos ? (
          <label className="flex h-9 w-full items-center gap-2 rounded-md border border-border bg-card px-2 text-text-secondary sm:ml-auto sm:w-56">
            <Search className="size-3.5 shrink-0" aria-hidden />
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar produto"
              aria-label="Buscar produto"
              className="h-9 min-w-0 flex-1 border-0 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
            />
          </label>
        ) : null}
      </div>

      {!carregado ? (
        <p className="text-sm text-text-secondary">
          Os produtos com reports aparecem aqui depois de filtrar.
        </p>
      ) : total === 0 ? (
        <p className="text-sm text-text-secondary">
          Nenhum report aberto com os filtros atuais.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {visiveis.map((produto) => (
            <ReportsFiltroChip
              key={produto.id}
              pressed={locais.produtoIds.includes(produto.id)}
              label={produto.nome}
              count={produto.total}
              vencidos={produto.vencidos}
              zero={produto.total === 0}
              onClick={() => locais.toggleProduto(produto.id)}
            />
          ))}
          {ocultos > 0 ? (
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-md border border-dashed border-border px-4 text-sm font-semibold text-text-secondary"
              onClick={() => setMostrarTodos(true)}
            >
              +{ocultos} produtos
            </button>
          ) : null}
          {muitos && mostrarTodos && !termo ? (
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-md border border-dashed border-border px-4 text-sm font-semibold text-text-secondary"
              onClick={() => setMostrarTodos(false)}
            >
              Mostrar menos
            </button>
          ) : null}
          {muitos && termo && visiveis.length === 0 ? (
            <p className="text-sm text-text-secondary">Nenhum produto encontrado.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
