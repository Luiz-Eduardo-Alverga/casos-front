import type { CreateProdutoVersaoRequest } from "@/interfaces/produto";

export function validateProdutoVersaoWriteBody(
  body: CreateProdutoVersaoRequest,
): Response | null {
  if (body?.Registro == null || Number.isNaN(Number(body.Registro))) {
    return Response.json({ error: "Registro é obrigatório" }, { status: 400 });
  }
  if (typeof body?.DataVersao !== "string" || !body.DataVersao.trim()) {
    return Response.json(
      { error: "DataVersao é obrigatório" },
      { status: 400 },
    );
  }
  if (typeof body?.Versao !== "string" || !body.Versao.trim()) {
    return Response.json({ error: "Versao é obrigatório" }, { status: 400 });
  }
  if (
    typeof body?.DataAberturaProjeto !== "string" ||
    !body.DataAberturaProjeto.trim()
  ) {
    return Response.json(
      { error: "DataAberturaProjeto é obrigatório" },
      { status: 400 },
    );
  }
  if (typeof body?.Status !== "string" || !body.Status.trim()) {
    return Response.json({ error: "Status é obrigatório" }, { status: 400 });
  }
  if (typeof body?.Release !== "number") {
    return Response.json({ error: "Release é obrigatório" }, { status: 400 });
  }
  if (typeof body?.MostrarPlanejamento !== "boolean") {
    return Response.json(
      { error: "MostrarPlanejamento é obrigatório" },
      { status: 400 },
    );
  }
  if (typeof body?.Helptools !== "boolean") {
    return Response.json({ error: "Helptools é obrigatório" }, { status: 400 });
  }
  if (typeof body?.estacionamento_ideias !== "boolean") {
    return Response.json(
      { error: "estacionamento_ideias é obrigatório" },
      { status: 400 },
    );
  }
  return null;
}
