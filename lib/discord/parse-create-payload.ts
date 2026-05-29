import type { CasoDiscordNotifyInput } from "@/lib/discord/types";

/** Campos enviados pelo front na criação de caso/report (POST /projeto-casos). */
export interface ProjetoCasoCreateBody {
  AtribuidoPara?: number;
  Prioridade?: number;
  DescricaoResumo?: string;
  Projeto?: number;
  VersaoProduto?: string;
  Cronograma_id?: number;
  Id_Usuario_AberturaCaso?: string | number;
  NaoPlanejado?: number | boolean;
  tipo_abertura?: string;
  report_prioridade?: number;
}

export function isReportCreateBody(body: ProjetoCasoCreateBody): boolean {
  const tipo = String(body.tipo_abertura ?? "")
    .trim()
    .toUpperCase();
  if (tipo === "REPORT") return true;
  return body.report_prioridade != null;
}

export function isNaoPlanejadoValue(value: unknown): boolean {
  return value === 1 || value === true || value === "1";
}

/** Report sempre notifica; caso apenas com checkbox "Não planejado" marcado. */
export function shouldNotifyDiscordOnCreate(body: ProjetoCasoCreateBody): boolean {
  if (isReportCreateBody(body)) return true;
  return isNaoPlanejadoValue(body.NaoPlanejado);
}

export function parseCreateResponseRegistro(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  const inner = root.data;
  if (inner && typeof inner === "object") {
    const registro = (inner as Record<string, unknown>).registro;
    if (typeof registro === "number" && Number.isFinite(registro)) {
      return registro;
    }
  }
  const direct = root.registro;
  if (typeof direct === "number" && Number.isFinite(direct)) return direct;
  return null;
}

export function buildNotifyInputFromCreate(
  body: ProjetoCasoCreateBody,
  registro: number,
): CasoDiscordNotifyInput | null {
  if (!shouldNotifyDiscordOnCreate(body)) {
    return null;
  }

  const atribuidoPara = Number(body.AtribuidoPara);
  if (!Number.isFinite(atribuidoPara) || atribuidoPara <= 0) {
    return null;
  }

  return {
    registro,
    atribuidoPara,
    prioridade: Number(body.Prioridade) || 0,
    descricaoResumo: String(body.DescricaoResumo ?? "").trim(),
    produtoId: body.Projeto != null ? Number(body.Projeto) : undefined,
    cronogramaId:
      body.Cronograma_id != null ? Number(body.Cronograma_id) : undefined,
    versaoProduto: String(body.VersaoProduto ?? "").trim() || undefined,
    aberturaUsuarioId: body.Id_Usuario_AberturaCaso,
    origem: isReportCreateBody(body) ? "report" : "criado",
  };
}

/** Resposta da API ao clonar caso (snake_case). */
export interface ClonarCasoApiData {
  registro?: number;
  atribuido_para?: number;
  prioridade?: number;
  descricao_resumo?: string;
  projeto?: number;
  versao_produto?: string;
  cronograma_id?: number;
  id_usuario_abertura_caso?: number;
  nao_planejado?: boolean | number;
}

export function buildNotifyInputFromClone(
  data: ClonarCasoApiData,
): CasoDiscordNotifyInput | null {
  if (!isNaoPlanejadoValue(data.nao_planejado)) {
    return null;
  }

  const registro = data.registro;
  const atribuidoPara = data.atribuido_para;
  if (
    typeof registro !== "number" ||
    !Number.isFinite(registro) ||
    typeof atribuidoPara !== "number" ||
    !Number.isFinite(atribuidoPara) ||
    atribuidoPara <= 0
  ) {
    return null;
  }

  return {
    registro,
    atribuidoPara,
    prioridade: Number(data.prioridade) || 0,
    descricaoResumo: String(data.descricao_resumo ?? "").trim(),
    produtoId: data.projeto,
    cronogramaId: data.cronograma_id,
    versaoProduto: String(data.versao_produto ?? "").trim() || undefined,
    aberturaUsuarioId: data.id_usuario_abertura_caso,
    origem: "clonado",
  };
}
