"use client";

import { UserDropDown } from "@/components/user-dropdown";

export function ReportsHeader() {
  return (
    <header className="border-b border-border sticky top-0 z-10 bg-card">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg">
            <span className="text-lg sm:text-xl font-bold text-primary-foreground">X</span>
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-foreground">Softcasos</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Abertura de casos de forma rápida e eficiente</p>
          </div>
        </div>
        <UserDropDown />
      </div>
    </header>
  );
}
