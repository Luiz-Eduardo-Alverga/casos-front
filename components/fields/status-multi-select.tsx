"use client";

import * as React from "react";
import { CircleDot } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useStatus } from "@/hooks/use-status";
import { toast } from "sonner";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/v2/combobox2";

const MAX_STATUS = 3;

export interface StatusMultiSelectProps {
  /** IDs de status (Registro) */
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export function StatusMultiSelect({
  value,
  onChange,
  disabled = false,
  label = "Status",
  id,
}: StatusMultiSelectProps) {
  const anchor = useComboboxAnchor();
  const { data: statusList = [], isLoading } = useStatus();

  const items = React.useMemo(
    () => (statusList ?? []).map((s) => String(s.Registro)),
    [statusList],
  );

  const labelById = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const s of statusList ?? []) {
      m.set(String(s.Registro), s.descricao ?? s.tipo ?? String(s.Registro));
    }
    return m;
  }, [statusList]);

  const handleValueChange = React.useCallback(
    (next: unknown) => {
      const arr = Array.isArray(next)
        ? next.filter((v): v is string => typeof v === "string")
        : [];
      if (arr.length > MAX_STATUS) {
        toast.message("No máximo 3 status podem ser selecionados.");
        return;
      }
      onChange(arr);
    },
    [onChange],
  );

  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-sm font-medium text-text-label flex items-center gap-1.5"
      >
        <CircleDot className="h-3.5 w-3.5 text-muted-foreground" />
        {label}{" "}
        <span className="text-muted-foreground font-normal text-xs">
          (máx. {MAX_STATUS})
        </span>
      </Label>
      <Combobox
        multiple
        autoHighlight
        items={items}
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <ComboboxChips ref={anchor} className="w-full  h-[42px] ">
          <ComboboxValue>
            {(values: string[]) => (
              <React.Fragment>
                {values.map((v) => (
                  <ComboboxChip key={v}>{labelById.get(v) ?? v}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={id}
                  placeholder={
                    values.length >= MAX_STATUS
                      ? "Limite atingido"
                      : isLoading
                        ? "Carregando..."
                        : "Buscar status..."
                  }
                  disabled={disabled || values.length >= MAX_STATUS}
                />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>
            {isLoading ? "Carregando status..." : "Nenhum status encontrado."}
          </ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {labelById.get(item) ?? item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
