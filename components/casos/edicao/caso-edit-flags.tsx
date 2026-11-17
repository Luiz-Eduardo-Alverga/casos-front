"use client";

import { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { cn } from "@/lib/utils";

/** Nomes dos campos de flag no formulário de edição de caso. */
export type CasoEditFlagName = "liberacao" | "entregue" | "atualizacaoAutomatica";

const CASO_EDIT_FLAGS: { name: CasoEditFlagName; label: string }[] = [
  { name: "liberacao", label: "Liberação" },
  { name: "entregue", label: "Entregue" },
  { name: "atualizacaoAutomatica", label: "Atualização Automática" },
];

/**
 * Flags do caso (Liberação, Entregue, Atualização Automática) exibidas como
 * pílulas com checkbox no header do card "Classificação e Origem".
 * O valor vai para a API junto com o "Salvar" da edição.
 */
export function CasoEditFlags() {
  const { control } = useFormContext();
  const { isDisabled } = useCasoForm();
  // O card aparece em mais de uma aba ao mesmo tempo (abas inativas ficam montadas):
  // id único por instância para o <label htmlFor> não apontar para outra aba.
  const instanceId = useId();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {CASO_EDIT_FLAGS.map(({ name, label }) => (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field }) => {
            const id = `${instanceId}-caso-flag-${name}`;
            const checked = Boolean(field.value);
            return (
              <label
                htmlFor={id}
                className={cn(
                  "inline-flex h-7 items-center gap-2 rounded-full border border-border px-3 text-xs font-medium text-text-primary transition-colors",
                  checked && "border-primary/40 bg-muted",
                  isDisabled
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer hover:bg-muted",
                )}
              >
                <Checkbox
                  id={id}
                  ref={field.ref}
                  checked={checked}
                  onCheckedChange={(value) => field.onChange(value === true)}
                  onBlur={field.onBlur}
                  disabled={isDisabled}
                  className="h-3.5 w-3.5 [&_svg]:h-3 [&_svg]:w-3"
                />
                {label}
              </label>
            );
          }}
        />
      ))}
    </div>
  );
}
