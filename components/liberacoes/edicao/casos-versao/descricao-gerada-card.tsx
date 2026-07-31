"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/painel/empty-state";
import { LiberacaoCardHeader } from "@/components/liberacoes/liberacao-card-header";
import type { ReleaseNotesData } from "@/lib/types/release-notes";

interface DescricaoGeradaCardProps {
  generating: boolean;
  resultado: ReleaseNotesData | null;
}

export function DescricaoGeradaCard({
  generating,
  resultado,
}: DescricaoGeradaCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!resultado?.registro_liberacao) return;
    try {
      await navigator.clipboard.writeText(resultado.registro_liberacao);
      setCopied(true);
      toast.success("Markdown copiado.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o texto.");
    }
  };

  return (
    <div className="sticky top-0 self-start">
      <Card className="rounded-lg bg-card shadow-card min-h-screen">
        <LiberacaoCardHeader icon={Sparkles} title="Descrição gerada" />
        <CardContent className="p-6 pt-2">
          {generating ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : resultado != null ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 text-[11.5px] text-text-secondary">
                  {resultado.produto ? (
                    <p>
                      <span className="font-medium text-foreground">
                        Produto:
                      </span>{" "}
                      {resultado.produto}
                    </p>
                  ) : null}
                  {resultado.versoes?.length > 0 ? (
                    <p>
                      <span className="font-medium text-foreground">
                        Versões:
                      </span>{" "}
                      {resultado.versoes.join(", ")}
                    </p>
                  ) : null}
                  {typeof resultado.total_casos === "number" ? (
                    <p>
                      <span className="font-medium text-foreground">
                        Casos:
                      </span>{" "}
                      {resultado.total_casos}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCopy()}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  Copiar
                </Button>
              </div>
              <div className=" overflow-y-auto pr-1 text-[12.5px] leading-relaxed text-text-secondary [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-[14px] [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mb-1.5 [&_h3]:mt-2.5 [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-1.5 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mb-2 [&_ul]:space-y-1">
                <ReactMarkdown>{resultado.registro_liberacao}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="Nenhuma descrição gerada"
              description="Marque casos com a flag Liberação e clique em Gerar descrição com IA."
              className="min-h-[240px] px-2"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
