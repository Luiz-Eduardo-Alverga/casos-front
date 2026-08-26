"use client";

import { CategoriaBadge } from "@/components/casos/tabela/categoria-badge";
import { formatLiberacaoDateDisplay } from "@/components/liberacoes/utils";
import type { PainelIdeiaItem } from "@/services/painel-ideias/get-painel-ideias";

interface AvaliarMelhoriaInfoProps {
  item: PainelIdeiaItem;
}

function MetaField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
        {label}
      </span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  );
}

export function AvaliarMelhoriaInfo({ item }: AvaliarMelhoriaInfoProps) {
  const titulo =
    item.descricao_resumo_tratada?.trim() ||
    item.descricao_resumo?.trim() ||
    item.descricao?.trim() ||
    "—";
  const objetivo = item.objetivo?.trim() || "—";
  const importancia = item.importancia?.trim();
  const casoLabel =
    item.numero_caso != null ? `#${item.numero_caso}` : null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-divider bg-muted/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-medium text-text-secondary">
          #{item.registro}
        </span>
        {item.tipo?.trim() ? (
          <CategoriaBadge categoria={item.tipo} />
        ) : (
          <span className="inline-flex w-fit items-center rounded-full border border-border-divider bg-background px-1.5 py-0 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Melhoria
          </span>
        )}
        {importancia ? (
          <span className="inline-flex w-fit items-center rounded-full border-transparent bg-panel-badge-importance-yellow-bg px-1.5 py-0 text-xs font-semibold text-panel-badge-importance-yellow">
            {importancia}
          </span>
        ) : null}
      </div>

      <p className="text-sm font-semibold leading-snug text-text-primary">
        {titulo}
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-x-4 gap-y-2">
        <MetaField label="Produto" value={item.produto?.trim() || "—"} />
        <MetaField label="Setor" value={item.setor?.trim() || "—"} />
        <MetaField
          label="Abertura"
          value={formatLiberacaoDateDisplay(item.datas)}
        />
        <MetaField
          label="Aberto por"
          value={item.nome_suporte?.trim() || "—"}
        />
        {casoLabel ? (
          <MetaField label="Caso vinculado" value={casoLabel} />
        ) : null}
      </div>

      <div className="flex flex-col gap-1 rounded-md border border-border-divider bg-background px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Objetivo
        </span>
        <p className="text-sm leading-relaxed text-text-primary">
          {objetivo}
        </p>
      </div>
    </div>
  );
}
