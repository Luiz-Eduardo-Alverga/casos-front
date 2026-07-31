"use client";

import type { LucideIcon } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface LiberacaoCardHeaderProps {
  icon: LucideIcon;
  title: string;
  right?: React.ReactNode;
}

export function LiberacaoCardHeader({ icon: Icon, title, right }: LiberacaoCardHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 border-b border-border-divider space-y-0">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-text-primary" />
        <CardTitle className="text-sm font-semibold text-text-primary">{title}</CardTitle>
      </div>
      {right}
    </CardHeader>
  );
}
