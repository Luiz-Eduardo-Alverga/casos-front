"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { LiberacaoEditView } from "@/components/liberacoes/edicao";
import { RequirePermission } from "@/components/require-permission";

interface LiberacoesEditPageProps {
  params: Promise<{ registro: string }>;
}

export default function LiberacoesEditPage({ params }: LiberacoesEditPageProps) {
  const router = useRouter();
  const { registro } = use(params);

  if (!registro?.trim()) {
    router.replace("/liberacoes");
    return null;
  }

  return (
    <RequirePermission permission="list-release">
      <div className="flex flex-1 flex-col px-6 pt-20 lg:min-h-0 lg:overflow-hidden">
        <LiberacaoEditView registro={registro} />
      </div>
    </RequirePermission>
  );
}
