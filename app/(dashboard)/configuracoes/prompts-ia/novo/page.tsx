import { PromptsIaForm } from "@/components/configuracoes/prompts-ia/prompts-ia-form";
import { RequirePermission } from "@/components/require-permission";

export default function NovoPromptPage() {
  return (
    <RequirePermission permission="create-prompts">
      <PromptsIaForm mode="create" />
    </RequirePermission>
  );
}
