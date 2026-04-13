"use client";

import * as React from "react";
import { Smartphone } from "lucide-react";
import { Label } from "@/components/ui/label";
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

export interface DeviceMultiSelectOption {
  value: string;
  label: string;
}

export interface DeviceMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: DeviceMultiSelectOption[];
  disabled?: boolean;
  label?: string;
  id?: string;
  emptyText?: string;
  placeholder?: string;
}

export function DeviceMultiSelect({
  value,
  onChange,
  options,
  disabled = false,
  label = "Dispositivos suportados",
  id,
  emptyText = "Nenhum dispositivo encontrado.",
  placeholder = "Selecione os dispositivos suportados...",
}: DeviceMultiSelectProps) {
  const anchor = useComboboxAnchor();

  const items = React.useMemo(() => options.map((item) => item.value), [options]);

  const labelById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const option of options) {
      map.set(option.value, option.label);
    }
    return map;
  }, [options]);

  const filterByLabel = React.useCallback(
    (itemValue: unknown, query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const idValue = String(itemValue);
      const itemLabel = (labelById.get(idValue) ?? idValue).toLowerCase();
      return itemLabel.includes(q) || idValue.toLowerCase().includes(q);
    },
    [labelById],
  );

  const handleValueChange = React.useCallback(
    (next: unknown) => {
      if (!Array.isArray(next)) {
        onChange([]);
        return;
      }
      const arr = next
        .map((v) => (typeof v === "string" ? v : String(v)))
        .filter((v) => v.length > 0);
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
        <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
      </Label>
      <Combobox
        multiple
        autoHighlight
        items={items}
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        filter={filterByLabel}
      >
        <ComboboxChips ref={anchor} className="w-full min-h-[42px] h-auto rounded-lg">
          <ComboboxValue>
            {(values: string[]) => (
              <React.Fragment>
                {values.map((idValue) => (
                  <ComboboxChip key={idValue}>
                    {labelById.get(idValue) ?? idValue}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={id}
                  placeholder={placeholder}
                  disabled={disabled}
                />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>{emptyText}</ComboboxEmpty>
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
