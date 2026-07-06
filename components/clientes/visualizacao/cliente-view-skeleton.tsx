"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "@/components/casos/edicao/caso-edit-card-header";
import { FileText, MapPin, MessageSquare, Package } from "lucide-react";
import { CARD_HEADER_PRESETS } from "@/lib/casos/card-header-theme";

function CardSkeleton({ title, icon: Icon }: { title: string; icon: typeof FileText }) {
  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CasoEditCardHeader title={title} icon={Icon} />
      <CardContent className="space-y-4 p-6 pt-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full max-w-[180px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ClienteViewSkeleton() {
  const produtosPreset = CARD_HEADER_PRESETS.clientes;

  return (
    <div className="flex flex-1 flex-col lg:min-h-0 lg:overflow-hidden">
      <div className="flex shrink-0 flex-col gap-4">
        <Skeleton className="h-5 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-[420px] max-w-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="mt-2 flex-1 overflow-auto pb-12">
        <div className="flex flex-col gap-2 min-w-0">
          <CardSkeleton title="Dados gerais" icon={FileText} />
          <CardSkeleton title="Contato" icon={MessageSquare} />
          <CardSkeleton title="Endereço" icon={MapPin} />
          <Card
            className="rounded-lg bg-card shadow-card"
          >
            <CasoEditCardHeader
              title="Produtos / URLs de acesso"
              icon={produtosPreset.icon}
              iconClassName={produtosPreset.iconClassName}
            />
            <CardContent className="space-y-4 p-6 pt-2">
              <Skeleton className="h-16 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
