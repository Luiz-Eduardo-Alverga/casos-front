"use client";

import { Label } from "@/components/ui/label";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { LucideIcon } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";

interface ComboboxFieldProps {
  name: string;
  label: string;
  icon: LucideIcon;
  options: ComboboxOption[];
  placeholder?: string;
  emptyText?: string;
  onSearchChange?: (search: string) => void;
  searchDebounceMs?: number;
  disabled?: boolean;
  required?: boolean;
}

export function ComboboxField({
  name,
  label,
  icon: Icon,
  options,
  placeholder = "Selecione...",
  emptyText,
  onSearchChange,
  searchDebounceMs,
  disabled = false,
  required = false,
}: ComboboxFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label className="text-sm font-medium text-text-label">
          {label} {required && <span className="text-text-error">*</span>}
        </Label>

        {error && (
          <p className="text-sm text-destructive">{error.message as string}</p>
        )}
      </div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="[&_button]:h-[42px] [&_button]:rounded-lg [&_button]:border-border-input">
            <Combobox
              options={options}
              value={field.value}
              onValueChange={field.onChange}
              placeholder={placeholder}
              emptyText={emptyText}
              onSearchChange={onSearchChange}
              searchDebounceMs={searchDebounceMs}
              disabled={disabled}
            />
          </div>
        )}
      />
    </div>
  );
}
