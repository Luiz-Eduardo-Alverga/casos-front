"use client";

import { Ticket, UserRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const TAB_TRIGGER_CLASS = cn(
  "group shrink-0 rounded-full px-3 py-1.5 text-sm font-medium gap-1.5",
  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
  "data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-muted data-[state=inactive]:hover:text-foreground",
);

export function ClienteViewHeader() {
  const router = useRouter();

  return (
    <div className="flex shrink-0 items-center justify-between gap-4">
      <TabsList
        className={cn(
          "inline-flex h-9 w-auto shrink-0 flex-nowrap items-center justify-start gap-0 overflow-x-auto rounded-full bg-white p-1 text-muted-foreground shadow-sm",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        <TabsTrigger value="dados" className={TAB_TRIGGER_CLASS}>
          <UserRound className="h-3.5 w-3.5" />
          Dados
        </TabsTrigger>
        <TabsTrigger value="tickets" className={TAB_TRIGGER_CLASS}>
          <Ticket className="h-3.5 w-3.5" />
          Ocorrências
        </TabsTrigger>
      </TabsList>

      <Button
        className="flex shrink-0 items-center gap-2"
        variant="outline"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Voltar</span>
      </Button>
    </div>
  );
}
