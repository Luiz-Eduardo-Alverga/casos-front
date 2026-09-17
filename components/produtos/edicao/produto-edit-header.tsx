"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { cn } from "@/lib/utils";
import type { ProdutoEditTab } from "@/components/produtos/edicao/produto-edit-url-parsers";

export const PRODUTO_EDIT_ASIDE_WIDTH_CLASS = "lg:w-[362px]";

export const PRODUTO_EDIT_TAB_ITEMS: Array<{
  value: ProdutoEditTab;
  label: string;
}> = [
  { value: "dados", label: PRODUTO_LABELS.abaDados },
  { value: "versoes", label: PRODUTO_LABELS.abaVersoes },
  { value: "modulos", label: PRODUTO_LABELS.abaModulos },
  { value: "checklist", label: PRODUTO_LABELS.abaChecklist },
  { value: "scripts", label: PRODUTO_LABELS.abaScripts },
];

const TAB_LIST_CLASS = cn(
  "relative -mb-px h-auto min-w-0 w-full items-end justify-start gap-6 rounded-none bg-transparent p-0",
  "flex flex-nowrap overflow-x-auto overscroll-x-contain text-muted-foreground",
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
);

const TAB_TRIGGER_CLASS = cn(
  "shrink-0 rounded-none bg-transparent px-0.5 pb-2.5 pt-0 text-sm shadow-none",
  "border-b-2 border-transparent",
  "data-[state=inactive]:font-medium data-[state=inactive]:text-muted-foreground",
  "data-[state=inactive]:hover:text-foreground",
  "data-[state=active]:border-primary data-[state=active]:bg-transparent",
  "data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none",
);

export interface ProdutoEditHeaderProps {
  onBack: () => void;
  canEdit: boolean;
  isSaving: boolean;
  formId: string;
}

export function ProdutoEditHeader({
  onBack,
  canEdit,
  isSaving,
  formId,
}: ProdutoEditHeaderProps) {
  return (
    <div className="flex shrink-0 flex-col gap-2 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col border-b border-border">
        <TabsList className={TAB_LIST_CLASS}>
          {PRODUTO_EDIT_TAB_ITEMS.map((tab) => (
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

      <div
        className={cn(
          "flex w-full shrink-0 flex-row items-center gap-2",
          PRODUTO_EDIT_ASIDE_WIDTH_CLASS,
        )}
      >
        <Button
          type="button"
          variant="outline"
          className="h-9 min-w-0 flex-1 px-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{PRODUTO_LABELS.voltar}</span>
        </Button>
        {canEdit ? (
          <Button
            type="submit"
            form={formId}
            disabled={isSaving}
            className="h-9 min-w-0 flex-1 px-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                <span className="truncate">{PRODUTO_LABELS.salvando}</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{PRODUTO_LABELS.salvar}</span>
              </>
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
