import type { CreateSgpCadastroRequest } from "@/interfaces/sgp-cadastro";
import type { Setor } from "@/services/auxiliar/setores";
import { SGP_PROJETO_HIDDEN_DEFAULTS } from "@/components/projetos/cadastro/constants";
import type { ProjetoCreateFormData } from "@/components/projetos/cadastro/schema";

/** Formata data para API SGP: `YYYY-MM-DD 00:00:00` (fuso America/Sao_Paulo). */
export function formatDateTimeSgp(date: Date): string {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return `${ymd} 00:00:00`;
}

export function resolveSetorIdByNome(
  setorNome: string | undefined,
  setores: Setor[] | undefined,
): string {
  if (!setorNome?.trim() || !setores?.length) return "";
  const found = setores.find(
    (s) => s.nome.trim().toLowerCase() === setorNome.trim().toLowerCase(),
  );
  return found ? String(found.id) : "";
}

export function buildCreateSgpProjetoPayload(
  data: ProjetoCreateFormData,
): CreateSgpCadastroRequest {
  const objetivoId = data.objetivo?.trim()
    ? Number(data.objetivo)
    : 0;

  return {
    NomeProjeto: data.nomeProjeto.trim(),
    Datas: formatDateTimeSgp(data.dataInicio),
    DataDesativado: data.dataEncerramento
      ? formatDateTimeSgp(data.dataEncerramento)
      : formatDateTimeSgp(data.dataInicio),
    Tipo: data.tipo,
    Status: data.status,
    Usuario: Number(data.usuario),
    ObjetivoID: Number.isFinite(objetivoId) ? objetivoId : 0,
    Necessidades: data.necessidades?.trim() || undefined,
    Expectativas: data.expectativas?.trim() || undefined,
    Cliente: SGP_PROJETO_HIDDEN_DEFAULTS.Cliente,
    PDV: SGP_PROJETO_HIDDEN_DEFAULTS.PDV,
    ClasseProjeto: SGP_PROJETO_HIDDEN_DEFAULTS.ClasseProjeto,
  };
}
