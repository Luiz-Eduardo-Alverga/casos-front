import type { UpdateProdutoModuloRequest } from "@/interfaces/produto";

export function validateProdutoModuloWriteBody(
  body: UpdateProdutoModuloRequest,
): Response | null {
  if (body?.Registro == null || Number.isNaN(Number(body.Registro))) {
    return Response.json({ error: "Registro é obrigatório" }, { status: 400 });
  }
  if (typeof body?.NomeModulo !== "string" || !body.NomeModulo.trim()) {
    return Response.json(
      { error: "NomeModulo é obrigatório" },
      { status: 400 },
    );
  }
  return null;
}
