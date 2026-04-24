"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface PermissionCheckCardProps {
  id: string;
  label: string;
  description?: string | null;
  checked: boolean;
  onToggle: (next: boolean) => void;
}

/**
 * Item da grade de permissões: checkbox + label + descrição.
 * Quando marcado, o card ganha borda/ fundo `papeis-perm-selected-*`.
 */
export function PermissionCheckCard({
  id,
  label,
  description,
  checked,
  onToggle,
}: PermissionCheckCardProps) {
  const checkboxId = `perm-${id}`;
  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors",
        checked
          ? "bg-papeis-perm-selected-bg border-papeis-perm-selected-border"
          : "bg-card border-border-divider hover:bg-page-background",
      )}
    >
      <Checkbox
        id={checkboxId}
        checked={checked}
        onCheckedChange={(value) => onToggle(value === true)}
        className="mt-0.5"
      />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-text-primary truncate">
          {label}
        </span>
        {description && (
          <span className="text-xs text-text-secondary line-clamp-2">
            {description}
          </span>
        )}
      </div>
    </label>
  );
}
