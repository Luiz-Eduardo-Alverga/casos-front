"use client";

import { ProdutoCreateForm } from "@/components/produtos/cadastro";
import { RequirePermission } from "@/components/require-permission";

export default function ProdutosNovoPage() {
  return (
    <RequirePermission permission="create-product">
      <ProdutoCreateForm />
    </RequirePermission>
  );
}
