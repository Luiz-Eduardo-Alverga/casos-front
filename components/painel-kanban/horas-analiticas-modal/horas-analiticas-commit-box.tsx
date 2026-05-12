"use client";

import { WandSparkles } from "lucide-react";

export function HorasAnaliticasCommitBox() {
  return (
    <section className="overflow-hidden rounded-lg border border-border-divider bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-border-divider bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">
          Descrição para Commit
        </h3>

        <button
          type="button"
          className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs font-semibold text-text-primary transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Gerar descrição de commit automaticamente"
        >
          <WandSparkles className="h-3.5 w-3.5" aria-hidden />
          Gerar Automático
        </button>
      </header>

      <div className="min-h-20 px-4 py-4">
        <p className="text-sm text-slate-400">
          Digite ou gere automaticamente a descrição do commit...
        </p>
      </div>
    </section>
  );
}
