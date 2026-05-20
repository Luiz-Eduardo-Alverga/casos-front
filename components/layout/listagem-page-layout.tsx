"use client";

import type { ReactNode } from "react";

export interface ListagemPageLayoutProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function ListagemPageLayout({
  title,
  subtitle,
  actions,
  children,
}: ListagemPageLayoutProps) {
  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
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
