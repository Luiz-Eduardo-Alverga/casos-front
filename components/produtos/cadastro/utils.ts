import type { User } from "@/lib/auth";
import type { Setor } from "@/services/auxiliar/setores";
import type { Usuario } from "@/services/auxiliar/usuarios";
import type { ProdutoData, ProdutoPayload } from "@/services/produtos/produtos";
import { isVacaLeiteira } from "@/components/produtos/utils";
import type { ProdutoFormData } from "@/components/produtos/cadastro/schema";

export interface BuildCreateProdutoPayloadContext {
  setores?: Setor[];
  usuarios?: Usuario[];
  currentUser?: User | null;
}

export function resolveSetorNomeById(
  id: string | undefined,
  setores: Setor[] | undefined,
): string {
  if (!id?.trim() || !setores?.length) return "";
  return setores.find((setor) => String(setor.id) === id)?.nome?.trim() ?? "";
}

export function resolveColaboradorNome(
  id: string | undefined,
  usuarios: Usuario[] | undefined,
  currentUser?: User | null,
): string {
  if (!id?.trim()) return "";
  if (currentUser && String(currentUser.id) === id) {
    return currentUser.nome.trim();
  }
  return (
    usuarios?.find((usuario) => usuario.id === id)?.nome_suporte?.trim() ?? ""
  );
}

export function parseOptionalId(value: string | undefined): number | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseVinculadoA(value: string | undefined): number {
  const parsed = parseOptionalId(value);
  return parsed != null && parsed > 0 ? parsed : 0;
}

export function vacaLeiteiraToApi(value: boolean): number {
  return value ? -1 : 0;
}

export function resolveSetorIdByNome(
  nome: string | undefined,
  setores: Setor[] | undefined,
): string {
  if (!nome?.trim() || !setores?.length) return "";
  const found = setores.find(
    (setor) => setor.nome.trim().toLowerCase() === nome.trim().toLowerCase(),
  );
  return found ? String(found.id) : "";
}

export function resolveColaboradorIdByNome(
  nome: string | undefined,
  usuarios: Usuario[] | undefined,
  currentUser?: User | null,
): string {
  const norm = nome?.trim().toLowerCase();
  if (!norm) return "";
  if (currentUser?.nome.trim().toLowerCase() === norm) {
    return String(currentUser.id);
  }
  return (
    usuarios?.find((usuario) => usuario.nome_suporte.trim().toLowerCase() === norm)
      ?.id ?? ""
  );
}

export function formValueToSetorNome(
  value: string | undefined,
  setores: Setor[] | undefined,
  fallback = "",
): string {
  return resolveSetorNomeById(value, setores) || value?.trim() || fallback;
}

export function formValueToColaboradorNome(
  value: string | undefined,
  usuarios: Usuario[] | undefined,
  currentUser?: User | null,
  fallback = "",
): string {
  return (
    resolveColaboradorNome(value, usuarios, currentUser) ||
    value?.trim() ||
    fallback
  );
}

export function colaboradorLabelById(
  id: number | null | undefined,
  usuarios: Usuario[] | undefined,
  currentUser?: User | null,
): string {
  if (id == null || id <= 0) return "";
  const key = String(id);
  if (currentUser && String(currentUser.id) === key) {
    return currentUser.nome.trim();
  }
  return usuarios?.find((usuario) => usuario.id === key)?.nome_suporte?.trim() || `#${id}`;
}

export function parseVinculadoAForUpdate(
  value: string | undefined,
  existing: ProdutoData,
): number {
  const current = parseVinculadoA(value);
  const loaded = parseVinculadoA(
    existing.VinculadoA > 0 ? String(existing.VinculadoA) : "",
  );
  if (current === loaded) return existing.VinculadoA ?? 0;
  return current;
}

export function produtoToPayload(
  produto: ProdutoData,
): ProdutoPayload & { DataProjeto: string } {
  const { Registro: _registro, ...rest } = produto;
  return rest;
}

export function produtoToFormValues(
  produto: ProdutoData,
  context: BuildCreateProdutoPayloadContext,
): ProdutoFormData {
  const bugsId = produto.responsavel_bugs_suporte_id;
  const melhoriasId = produto.responsavel_melhorias_suporte_id;

  return {
    nomeProjeto: produto.NomeProjeto ?? "",
    setor: resolveSetorIdByNome(produto.Setor, context.setores) || produto.Setor || "",
    po:
      resolveColaboradorIdByNome(produto.PO, context.usuarios, context.currentUser) ||
      produto.PO ||
      "",
    scrumMaster:
      resolveColaboradorIdByNome(
        produto.ScrumMaster,
        context.usuarios,
        context.currentUser,
      ) ||
      produto.ScrumMaster ||
      "",
    vinculadoA: produto.VinculadoA > 0 ? String(produto.VinculadoA) : "",
    necessidadeComercial:
      produto.Comercial_Necessidades_ID != null
        ? String(produto.Comercial_Necessidades_ID)
        : "",
    responsavelSuporte:
      resolveSetorIdByNome(produto.Responsavel_Suporte, context.setores) ||
      produto.Responsavel_Suporte ||
      "",
    responsavelParametrizacao:
      resolveSetorIdByNome(produto.Responsavel_Parametrizacao, context.setores) ||
      produto.Responsavel_Parametrizacao ||
      "",
    responsavelBugs: bugsId != null && bugsId > 0 ? String(bugsId) : "",
    responsavelMelhorias:
      melhoriasId != null && melhoriasId > 0 ? String(melhoriasId) : "",
    informacoesTecnicas: produto.InformacoesTecnicas ?? "",
    mostrarConsulta: Boolean(produto.MostrarConsulta),
    mostrarTeste: Boolean(produto.MostrarTeste),
    faqExibir: Boolean(produto.FAQExibir),
    calcularBurndown: Boolean(produto.CalcularBurnDown),
    vacaLeiteira: isVacaLeiteira(produto.vacaLeiteira),
  };
}

export function buildUpdateProdutoPayload(
  data: ProdutoFormData,
  existing: ProdutoData,
  context: BuildCreateProdutoPayloadContext,
): ProdutoPayload & { DataProjeto: string } {
  const setor = formValueToSetorNome(data.setor, context.setores, existing.Setor);
  const po = formValueToColaboradorNome(
    data.po,
    context.usuarios,
    context.currentUser,
    existing.PO,
  );
  const scrumMaster = formValueToColaboradorNome(
    data.scrumMaster,
    context.usuarios,
    context.currentUser,
    existing.ScrumMaster,
  );
  const responsavelSuporte = formValueToSetorNome(
    data.responsavelSuporte,
    context.setores,
    existing.Responsavel_Suporte,
  );
  const responsavelParametrizacao = formValueToSetorNome(
    data.responsavelParametrizacao,
    context.setores,
    existing.Responsavel_Parametrizacao,
  );

  if (!setor.trim()) {
    throw new Error("Setor inválido. Recarregue a página e tente novamente.");
  }
  if (!po.trim()) {
    throw new Error(
      "Product Owner inválido. Recarregue a página e tente novamente.",
    );
  }
  if (!scrumMaster.trim()) {
    throw new Error(
      "Scrum Master inválido. Recarregue a página e tente novamente.",
    );
  }
  if (!responsavelSuporte.trim()) {
    throw new Error(
      "Responsável suporte inválido. Recarregue a página e tente novamente.",
    );
  }
  if (!responsavelParametrizacao.trim()) {
    throw new Error(
      "Responsável parametrização inválido. Recarregue a página e tente novamente.",
    );
  }

  return {
    DataProjeto: existing.DataProjeto,
    NomeProjeto: data.nomeProjeto.trim(),
    PO: po,
    ScrumMaster: scrumMaster,
    Setor: setor,
    Comercial_Necessidades_ID: parseOptionalId(data.necessidadeComercial),
    Responsavel_Suporte: responsavelSuporte,
    Responsavel_Parametrizacao: responsavelParametrizacao,
    Desativado: existing.Desativado,
    MostrarConsulta: data.mostrarConsulta,
    MostrarTeste: data.mostrarTeste,
    VinculadoA: parseVinculadoAForUpdate(data.vinculadoA, existing),
    FAQExibir: data.faqExibir,
    InformacoesTecnicas: data.informacoesTecnicas?.trim() || null,
    CalcularBurnDown: data.calcularBurndown,
    responsavel_bugs_suporte_id: parseOptionalId(data.responsavelBugs),
    responsavel_melhorias_suporte_id: parseOptionalId(data.responsavelMelhorias),
    vacaLeiteira: vacaLeiteiraToApi(data.vacaLeiteira),
  };
}

export function buildCreateProdutoPayload(
  data: ProdutoFormData,
  context: BuildCreateProdutoPayloadContext,
): ProdutoPayload {
  const setor = resolveSetorNomeById(data.setor, context.setores);
  if (!setor) {
    throw new Error("Setor inválido. Recarregue a página e tente novamente.");
  }

  const po = resolveColaboradorNome(data.po, context.usuarios, context.currentUser);
  if (!po) {
    throw new Error(
      "Product Owner inválido. Recarregue a página e tente novamente.",
    );
  }

  const scrumMaster = resolveColaboradorNome(
    data.scrumMaster,
    context.usuarios,
    context.currentUser,
  );
  if (!scrumMaster) {
    throw new Error(
      "Scrum Master inválido. Recarregue a página e tente novamente.",
    );
  }

  const responsavelSuporte = resolveSetorNomeById(
    data.responsavelSuporte,
    context.setores,
  );
  if (!responsavelSuporte) {
    throw new Error(
      "Responsável suporte inválido. Recarregue a página e tente novamente.",
    );
  }

  const responsavelParametrizacao = resolveSetorNomeById(
    data.responsavelParametrizacao,
    context.setores,
  );
  if (!responsavelParametrizacao) {
    throw new Error(
      "Responsável parametrização inválido. Recarregue a página e tente novamente.",
    );
  }

  const informacoesTecnicas = data.informacoesTecnicas?.trim() || null;

  return {
    NomeProjeto: data.nomeProjeto.trim(),
    PO: po,
    ScrumMaster: scrumMaster,
    Setor: setor,
    Comercial_Necessidades_ID: parseOptionalId(data.necessidadeComercial),
    Responsavel_Suporte: responsavelSuporte,
    Responsavel_Parametrizacao: responsavelParametrizacao,
    Desativado: false,
    MostrarConsulta: data.mostrarConsulta,
    MostrarTeste: data.mostrarTeste,
    VinculadoA: parseVinculadoA(data.vinculadoA),
    FAQExibir: data.faqExibir,
    InformacoesTecnicas: informacoesTecnicas,
    CalcularBurnDown: data.calcularBurndown,
    responsavel_bugs_suporte_id: parseOptionalId(data.responsavelBugs),
    responsavel_melhorias_suporte_id: parseOptionalId(data.responsavelMelhorias),
    vacaLeiteira: vacaLeiteiraToApi(data.vacaLeiteira),
  };
}
