"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface ReportsHeaderProps {
  onLogout: () => void;
}

export function ReportsHeader({ onLogout }: ReportsHeaderProps) {
  return (
    <header className="border-b border-border sticky top-0 z-10 bg-card">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg">
            <span className="text-lg sm:text-xl font-bold text-primary-foreground">X</span>
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-foreground">Sistema de Rastreamento de Bugs</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Painel de Relatórios Inteligente</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={onLogout}
          className="h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
        >
          <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
}
