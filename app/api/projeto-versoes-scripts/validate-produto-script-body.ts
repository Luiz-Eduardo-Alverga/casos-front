import type { CreateProdutoScriptRequest } from "@/interfaces/produto";

export function validateProdutoScriptWriteBody(
  body: CreateProdutoScriptRequest,
): Response | null {
  if (
    body?.projetoVersoes_id == null ||
    Number.isNaN(Number(body.projetoVersoes_id))
  ) {
    return Response.json(
      { error: "projetoVersoes_id é obrigatório" },
      { status: 400 },
    );
  }
  if (typeof body?.descricao !== "string" || !body.descricao.trim()) {
    return Response.json({ error: "descricao é obrigatório" }, { status: 400 });
  }
  if (typeof body?.procedimento !== "string" || !body.procedimento.trim()) {
    return Response.json(
      { error: "procedimento é obrigatório" },
      { status: 400 },
    );
  }
  return null;
}
