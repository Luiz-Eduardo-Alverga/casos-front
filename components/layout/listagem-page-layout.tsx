"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const LISTAGEM_CARD_STACK_GAP = "mb-2";

export interface ListagemPageLayoutProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function ListagemPageLayout({
  title,
  subtitle,
  actions,
  className,
  children,
}: ListagemPageLayoutProps) {
  return (
    <div className={cn("px-6 pt-20 pb-10 flex-1 flex flex-col", className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-text-primary">{title}</h1>
          <p className="text-sm text-text-secondary">{subtitle}</p>
        </div>
        {actions ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
