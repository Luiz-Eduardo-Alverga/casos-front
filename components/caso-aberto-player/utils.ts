import type { CasoTempos } from "@/interfaces/projeto-memoria";
import type { CasoAbertoAtivoResponse } from "@/services/projeto-casos-producao/get-caso-aberto-ativo";
import type { CasoAbertoPlayerViewModel } from "@/components/caso-aberto-player/types";

export function getProgressPercent(tempos?: CasoTempos | null): number {
  const estimado = Number(tempos?.estimado_minutos ?? 0);
  const realizado = Number(tempos?.realizado_minutos ?? 0);
  if (estimado <= 0) return 0;
  return Math.min(100, Math.round((realizado / estimado) * 100));
}

export function formatMinutosAsHm(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
}

export function formatElapsedHms(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getElapsedSecondsSince(isoDate: string): number {
  const start = new Date(isoDate).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((Date.now() - start) / 1000));
}

function buildTitleLine(
  casoId: number,
  produtoNome: string,
  produtoVersao: string,
): string {
  const nome = produtoNome.trim() || "Produto";
  const versao = produtoVersao.trim();
  return versao ? `#${casoId} - ${nome}` : `#${casoId} - ${nome}`;
}

function buildPathDescription(
  produtoNome: string,
  modulo: string | null | undefined,
  descricaoResumo: string | null | undefined,
): string {
  const produtoRaiz = produtoNome.split("(")[0]?.trim().toUpperCase() || "CASO";
  const mod = modulo?.trim();
  const resumo = descricaoResumo?.trim();

  if (mod && resumo) {
    return `${produtoRaiz} > ${mod} > ${resumo}`;
  }
  if (mod) return `${produtoRaiz} > ${mod}`;
  if (resumo) return `${produtoRaiz} > ${resumo}`;
  return produtoRaiz;
}

export function buildCasoAbertoPlayerViewModel(
  data: CasoAbertoAtivoResponse,
): CasoAbertoPlayerViewModel | null {
  if (!data.hasCasoAberto || !data.producao) return null;

  const producao = data.producao;
  const caso = data.caso?.caso;
  const produto = data.caso?.produto;
  const casoId = caso?.id ?? producao.registro;
  const produtoNome = produto?.nome ?? "";
  const produtoVersao = produto?.versao ?? "";
  const prioridade = caso?.caracteristicas?.prioridade ?? "";

  return {
    casoId,
    titulo:
      caso?.textos?.descricao_resumo?.trim() || `Caso #${producao.registro}`,
    titleLine: buildTitleLine(casoId, produtoNome, produtoVersao),
    pathDescription: buildPathDescription(
      produtoNome,
      caso?.caracteristicas?.modulo,
      caso?.textos?.descricao_resumo,
    ),
    prioridadeBadge: prioridade ? String(prioridade) : null,
    statusLabel: caso?.status?.status_tipo ?? "Em produção",
    produtoNome: produtoNome || "—",
    produtoVersao: produtoVersao || "—",
    horaAbertura: producao.hora_abertura_formatada ?? "—",
    horaAberturaIso: producao.hora_abertura,
    tipoProducao: producao.tipo_producao ?? "—",
    progressPercent: getProgressPercent(caso?.tempos),
    realizadoMinutos: Number(caso?.tempos?.realizado_minutos ?? 0),
    estimadoMinutos: Number(caso?.tempos?.estimado_minutos ?? 0),
  };
}
