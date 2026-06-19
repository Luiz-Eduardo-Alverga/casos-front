"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface PermissionCheckCardProps {
  id: string;
  label: string;
  description?: string | null;
  checked: boolean;
  onToggle: (next: boolean) => void;
  disabled?: boolean;
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
  disabled = false,
}: PermissionCheckCardProps) {
  const checkboxId = `perm-${id}`;
  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "flex items-start gap-3 min-h-20 rounded-lg border p-3 transition-colors",
        disabled
          ? "cursor-not-allowed opacity-60 bg-muted/30 border-border-divider"
          : "cursor-pointer",
        !disabled &&
          (checked
            ? "bg-papeis-perm-selected-bg border-papeis-perm-selected-border"
            : "bg-card border-border-divider hover:bg-page-background/40"),
      )}
    >
      <Checkbox
        id={checkboxId}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onToggle(value === true)}
        className="mt-0.5 h-5 w-5 rounded-[4px]"
      />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-semibold text-text-primary truncate">
          {label}
        </span>
        {description && (
          <span className="text-xs leading-4 text-text-secondary line-clamp-2">
            {description}
          </span>
        )}
      </div>
    </label>
  );
}
