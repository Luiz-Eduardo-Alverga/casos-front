"use client";

import { use } from "react";
import { PromptsIaForm } from "@/components/configuracoes/prompts-ia/prompts-ia-form";

interface EditarPromptPageProps {
  params: Promise<{ id: string }>;
}

export default function EditarPromptPage({ params }: EditarPromptPageProps) {
  const { id } = use(params);
  return <PromptsIaForm mode="edit" promptId={id} />;
}
