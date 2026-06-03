"use client";

import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const TAB_TRIGGER_CLASS = cn(
  "group shrink-0 rounded-full px-3 py-1.5 text-sm font-medium gap-1.5",
  "lg:flex-1 lg:min-w-0 lg:basis-0",
  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
  "data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-muted data-[state=inactive]:hover:text-foreground",
);

const TABS = [
  { value: "abertura", label: "Abertura" },
  { value: "stakes", label: "Stakes" },
  { value: "cronograma", label: "Cronograma" },
  { value: "escopo", label: "Escopo" },
  { value: "risco", label: "Risco" },
] as const;

function handleEmBreve() {
  toast("Em breve");
}

export function ProjetoEditHeader() {
  const router = useRouter();

  return (
    <div className="flex shrink-0 flex-col gap-6 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <TabsList
          className={cn(
            "flex h-9 w-full max-w-full min-w-0 flex-nowrap items-center justify-start gap-0 overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-full bg-white py-1 text-muted-foreground",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={TAB_TRIGGER_CLASS}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="flex w-full shrink-0 flex-row items-center justify-between gap-2 lg:w-[362px]">
        <Button
          type="button"
          variant="outline"
          className="flex-1 px-3"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Voltar
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 px-3"
          onClick={handleEmBreve}
        >
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          Clonar
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-destructive/30 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleEmBreve}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Excluir
        </Button>
      </div>
    </div>
  );
}
