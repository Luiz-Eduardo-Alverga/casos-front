"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
    <div className="rounded-lg bg-sky-50 dark:bg-sky-950/30 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(Boolean(v))}
          className="mt-0.5"
          disabled={disabled}
        />
        <div className="space-y-1">
          <Label
            htmlFor={id}
            className="text-sm font-medium text-text-primary cursor-pointer"
          >
            Não planejado
          </Label>
          <p className="text-xs text-text-secondary">{description}</p>
        </div>
      </div>
    </div>
  );
}
