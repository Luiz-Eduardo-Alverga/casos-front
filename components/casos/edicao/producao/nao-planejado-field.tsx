"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const DEFAULT_DESCRIPTION =
  "Marque se este caso não foi planejado (dispensa controle de tempo).";

export interface NaoPlanejadoFieldProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Substitui o texto de ajuda; se omitido, usa o padrão do formulário de estimativa. */
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function NaoPlanejadoField({
  checked,
  onCheckedChange,
  description = DEFAULT_DESCRIPTION,
  disabled,
  id = "nao-planejado",
}: NaoPlanejadoFieldProps) {
  return (
    <Label
      className={cn(
        "flex items-center gap-3 rounded-lg bg-sky-50 p-4 dark:bg-sky-950/30",
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(Boolean(v))}
        className="mt-0.5"
        disabled={disabled}
      />
      <div className="min-w-0 space-y-1 font-normal">
        <span className="block text-sm font-medium text-text-primary">
          Não planejado
        </span>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
    </Label>
  );
}
