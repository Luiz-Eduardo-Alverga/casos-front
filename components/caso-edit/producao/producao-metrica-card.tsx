"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ProducaoMetricaCardValueVariant =
  | "default"
  | "sky"
  | "purple"
  | "destructive";

export interface ProducaoMetricaCardProps {
  label: string;
  value: React.ReactNode;
  /** Estilo do valor: default (texto principal), sky, purple, destructive (vermelho + borda no card) */
  valueVariant?: ProducaoMetricaCardValueVariant;
  className?: string;
}

const valueVariantClasses: Record<ProducaoMetricaCardValueVariant, string> = {
  default: "text-text-primary",
  sky: "text-sky-600 dark:text-sky-400",
  purple: "text-purple-600 dark:text-purple-400",
  destructive: "text-destructive",
};

export function ProducaoMetricaCard({
  label,
  value,
  valueVariant = "default",
  className,
}: ProducaoMetricaCardProps) {
  const isDestructive = valueVariant === "destructive";

  return (
    <Card
      className={cn(
        "rounded-lg border bg-white shadow-sm",
        isDestructive && "border-destructive",
        className,
      )}
    >
      <CardContent className="p-4 pt-4">
        <p className="text-xs text-text-secondary mb-1">{label}</p>
        <div
          className={cn(
            "text-sm font-semibold",
            valueVariantClasses[valueVariant],
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
