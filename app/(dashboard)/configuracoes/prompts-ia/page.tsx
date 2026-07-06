import { PromptsIa } from "@/components/configuracoes/prompts-ia";
import { RequirePermission } from "@/components/require-permission";

export default function PromptsIaPage() {
  return (
    <RequirePermission permission="list-prompts">
      <PromptsIa />
    </RequirePermission>
  );
}
