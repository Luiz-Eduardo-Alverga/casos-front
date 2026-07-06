"use client";

import { useMemo, useRef } from "react";
import { Lock, Package, Text, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssistantPromptPreviewProps {
  template: string;
  className?: string;
}

function TemplateReadonlyPreview({ template }: { template: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => {
    const content = template.trim() || "Sem template definido.";
    return content.split("\n");
  }, [template]);

  return (
    <div
      ref={scrollRef}
      className="flex min-h-[120px] overflow-y-auto rounded-lg border border-border-divider bg-muted/30 font-mono text-xs"
    >
      <div className="select-none shrink-0 w-10 border-r border-border-divider bg-muted/40 px-2 py-2 text-right text-text-secondary">
        {lines.map((_, i) => (
          <div key={i + 1} className="leading-5">
            {i + 1}
          </div>
        ))}
      </div>
      <pre className="flex-1 whitespace-pre-wrap break-words p-2 leading-5 text-text-primary">
        {lines.join("\n")}
      </pre>
    </div>
  );
}

function InjectedDataCompact() {
  const items = [
    {
      icon: Package,
      label: "Produtos",
      variable: "{{produtos}}",
      description: "Preenche o campo de produto do caso.",
      color: "text-indigo-500",
    },
    {
      icon: Users,
      label: "Usuários",
      variable: "{{usuarios}}",
      description: "Preenche o campo de desenvolvedor do caso.",
      color: "text-emerald-500",
    },
    {
      icon: Text,
      label: "Texto ",
      variable: "{{texto}}",
      description:
        "Preenche os campos Titulo, Descrição e Informações adicionais do caso.",
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="space-y-2 rounded-lg border border-border-divider bg-muted/20 p-3">
      <div className="flex items-center gap-1.5">
        <Lock className="h-3.5 w-3.5 text-text-secondary" />
        <span className="text-xs font-semibold text-text-primary">
          Dados injetados pelo sistema
        </span>
      </div>
      <div className="space-y-2">
        {items.map(({ icon: Icon, label, variable, description, color }) => (
          <div
            key={variable}
            className="rounded-md border border-border-divider bg-card px-2.5 py-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon className={cn("h-3.5 w-3.5 shrink-0 ", color)} />
                <span className="text-[11px] font-bold uppercase tracking-wide text-text-primary truncate">
                  {label}
                </span>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-text-secondary">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AssistantPromptPreview({
  template,
  className,
}: AssistantPromptPreviewProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto",
        className,
      )}
    >
      <TemplateReadonlyPreview template={template} />
    </div>
  );
}
