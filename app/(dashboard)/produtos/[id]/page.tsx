"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ProdutoEditView } from "@/components/produtos/edicao";
import { RequirePermission } from "@/components/require-permission";

interface ProdutosEditPageProps {
  params: Promise<{ id: string }>;
}

export default function ProdutosEditPage({ params }: ProdutosEditPageProps) {
  const router = useRouter();
  const { id } = use(params);

  if (!id?.trim()) {
    router.replace("/produtos");
    return null;
  }

  return (
    <RequirePermission permission="list-product">
      <ProdutoEditView produtoId={id} />
    </RequirePermission>
  );
}
