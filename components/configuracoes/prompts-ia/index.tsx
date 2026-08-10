"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { CadastroFiltrosCard } from "@/components/cadastros/cadastro-filtros-card";
import { CadastroListagemCard } from "@/components/cadastros/cadastro-listagem-card";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { useFormAssistantPrompts } from "@/hooks/assistant/use-form-assistant-prompts";
import { useToggleFormAssistantPrompt } from "@/hooks/assistant/use-toggle-form-assistant-prompt";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import type { PromptType } from "@/lib/types/form-assistant-prompts";
import { PromptsIaTable } from "./prompts-ia-table";
import { PromptsIaSkeleton } from "./prompts-ia-skeleton";
import {
  PROMPT_TYPE_OPTIONS,
  PROMPT_TYPE_SUBTITLES,
  promptsIaTipoParsers,
} from "./prompts-ia-tipo-parsers";
import type { PromptRow } from "./types";

export function PromptsIa() {
  const router = useRouter();
  const [tipo, setTipo] = useQueryState("tipo", promptsIaTipoParsers.tipo);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: prompts, isLoading } = useFormAssistantPrompts(tipo);
  const toggleMutation = useToggleFormAssistantPrompt();

  const rbacReady = permissionsLoaded();
  const canCreate = !rbacReady || hasPermission("create-prompts");
  const canEdit = !rbacReady || hasPermission("edit-prompts");

  const filtered = useMemo(() => {
    const list = prompts ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.squadSetor?.toLowerCase().includes(q) ?? false),
    );
  }, [prompts, search]);

  function handleToggle(row: PromptRow) {
    if (!canEdit) return;
    setTogglingId(row.id);
    toggleMutation.mutate(row.id, {
      onSuccess: () => {
        toast.success(
          row.isActive ? "Prompt desativado." : "Prompt ativado.",
        );
      },
      onError: (err) => {
        toast.error(err.message || "Erro ao alternar status do prompt.");
      },
      onSettled: () => {
        setTogglingId(null);
      },
    });
  }

  return (
    <ListagemPageLayout
      title="Prompts IA"
      subtitle={PROMPT_TYPE_SUBTITLES[tipo]}
      actions={
        canCreate ? (
          <Button
            onClick={() =>
              router.push(`/configuracoes/prompts-ia/novo?tipo=${tipo}`)
            }
          >
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            Novo Prompt
          </Button>
        ) : undefined
      }
    >
      <CadastroFiltrosCard
        fieldLabel="Buscar"
        placeholder="Nome ou squad..."
        value={search}
        onChange={setSearch}
        inputAriaLabel="Buscar prompt"
        selectFilter={{
          label: "Tipo",
          value: tipo,
          onChange: (value) => {
            void setTipo(value as PromptType);
            setSearch("");
          },
          options: PROMPT_TYPE_OPTIONS,
          ariaLabel: "Filtrar por tipo de prompt",
        }}
      />

      <CadastroListagemCard
        title="Listagem de Prompts"
        icon={Sparkles}
        showTotalRecords
        totalRecords={filtered.length}
        totalRecordsUnit={{ singular: "prompt", plural: "prompts" }}
      >
        {isLoading ? (
          <PromptsIaSkeleton />
        ) : (
          <PromptsIaTable
            rows={filtered}
            tipo={tipo}
            togglingId={togglingId}
            canEdit={canEdit}
            onToggle={handleToggle}
          />
        )}
      </CadastroListagemCard>
    </ListagemPageLayout>
  );
}
