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
}: ComboboxFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {label}
        </Label>
        {error && (
          <p className="text-sm text-destructive">{error.message as string}</p>
        )}
      </div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
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
            
          </>
        )}
      />
    </div>
  );
}
