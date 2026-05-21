"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ProjetoEditView } from "@/components/projetos/edicao";
import { RequirePermission } from "@/components/require-permission";

interface ProjetosEditPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjetosEditPage({ params }: ProjetosEditPageProps) {
  const router = useRouter();
  const { id } = use(params);

  if (!id?.trim()) {
    router.replace("/projetos");
    return null;
  }

  return (
    <RequirePermission permission="list-project">
      <div className="flex flex-1 flex-col px-6 pt-20 lg:min-h-0 lg:overflow-hidden">
        <ProjetoEditView projetoId={id} />
      </div>
    </RequirePermission>
  );
}
