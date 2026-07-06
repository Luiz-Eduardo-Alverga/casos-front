"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ClienteDetailFieldProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function ClienteDetailField({
  label,
  value,
  className,
}: ClienteDetailFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="text-xs uppercase font-medium text-slate-400">
        {label}
      </span>
      <div className="text-xs leading-5 font-semibold text-text-primary">
        {value}
      </div>
    </div>
  );
}
