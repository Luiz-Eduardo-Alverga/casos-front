import type { CreateProdutoRequest } from "@/interfaces/produto";

export function validateProdutoWriteBody(
  body: CreateProdutoRequest,
): Response | null {
  const requiredStrings: Array<keyof CreateProdutoRequest> = [
    "DataProjeto",
    "NomeProjeto",
    "PO",
    "ScrumMaster",
    "Setor",
    "Responsavel_Suporte",
    "Responsavel_Parametrizacao",
  ];

  for (const field of requiredStrings) {
    const value = body?.[field];
    if (typeof value !== "string" || !value.trim()) {
      return Response.json(
        { error: `${String(field)} é obrigatório` },
        { status: 400 },
      );
    }
  }

  const requiredBooleans: Array<keyof CreateProdutoRequest> = [
    "Desativado",
    "MostrarConsulta",
    "MostrarTeste",
    "FAQExibir",
    "CalcularBurnDown",
  ];

  for (const field of requiredBooleans) {
    if (typeof body?.[field] !== "boolean") {
      return Response.json(
        { error: `${String(field)} é obrigatório` },
        { status: 400 },
      );
    }
  }

  if (typeof body?.vacaLeiteira !== "number") {
    return Response.json(
      { error: "vacaLeiteira é obrigatório" },
      { status: 400 },
    );
  }

  return null;
}
