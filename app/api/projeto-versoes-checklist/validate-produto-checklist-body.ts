import type { CreateProdutoChecklistRequest } from "@/interfaces/produto";

export function validateProdutoChecklistWriteBody(
  body: CreateProdutoChecklistRequest,
): Response | null {
  if (
    body?.Projeto_Versoes_ID == null ||
    Number.isNaN(Number(body.Projeto_Versoes_ID))
  ) {
    return Response.json(
      { error: "Projeto_Versoes_ID é obrigatório" },
      { status: 400 },
    );
  }
  if (typeof body?.DescricaoItem !== "string" || !body.DescricaoItem.trim()) {
    return Response.json(
      { error: "DescricaoItem é obrigatório" },
      { status: 400 },
    );
  }
  if (typeof body?.Ordenacao !== "number") {
    return Response.json({ error: "Ordenacao é obrigatório" }, { status: 400 });
  }
  return null;
}
