"use client";

import { Check, Copy, WandSparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { HorasAnaliticasCommitBoxProps } from "./types";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function HorasAnaliticasCommitBox({
  value,
  onChange,
  onGenerate,
  isGenerateDisabled = false,
}: HorasAnaliticasCommitBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-border-divider bg-card shadow-sm">
      <header className="flex items-center justify-between border-b border-border-divider bg-muted/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">
          Descrição para Commit
        </h3>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCopyDescription}
            disabled={isGenerateDisabled}
            className={cn(
              "inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs font-semibold text-text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              copied && "text-green-500",
            )}
            aria-label="Copiar descrição de commit"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
            {copied ? "Copiado!" : "Copiar"}
          </button>

          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerateDisabled}
            className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs font-semibold text-text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Gerar descrição de commit automaticamente"
          >
            <WandSparkles className="h-3.5 w-3.5" aria-hidden />
            Gerar Automático
          </button>
        </div>
      </header>

      <div className="">
        <Textarea
          aria-label="Descrição para commit"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Digite ou gere automaticamente a descrição do commit..."
          className="min-h-24 border-none resize-none rounded-lg border-border-input bg-card text-sm text-text-primary placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring"
        />
      </div>
    </section>
  );
}
