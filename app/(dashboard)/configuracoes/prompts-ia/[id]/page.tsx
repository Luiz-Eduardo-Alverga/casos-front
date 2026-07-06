"use client";

import { use } from "react";
import { PromptsIaForm } from "@/components/configuracoes/prompts-ia/prompts-ia-form";
import { RequirePermission } from "@/components/require-permission";

interface EditarPromptPageProps {
  params: Promise<{ id: string }>;
}

export default function EditarPromptPage({ params }: EditarPromptPageProps) {
  const { id } = use(params);

  return (
    <RequirePermission permission="edit-prompts">
      <PromptsIaForm mode="edit" promptId={id} />
    </RequirePermission>
  );
}
