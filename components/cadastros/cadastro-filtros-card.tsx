"use client";

import { Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CadastroFiltrosCardProps {
  /** Rótulo do campo (ex.: "Nome") */
  fieldLabel: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  inputAriaLabel: string;
}

export function CadastroFiltrosCard({
  fieldLabel,
  placeholder,
  value,
  onChange,
  inputAriaLabel,
}: CadastroFiltrosCardProps) {
  return (
    <Card className="bg-card shadow-card rounded-lg shrink-0 mb-6">
      <CardHeader className="flex flex-row justify-between px-5 py-2 border-b border-border-divider">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Filtros
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-2 sm:col-span-2 lg:col-span-3">
            <Label className="text-sm font-medium text-text-label">
              {fieldLabel}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                className="pl-9 h-[42px] rounded-lg border-border-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={inputAriaLabel}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
