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
    descricaoResumo: caso?.textos?.descricao_resumo?.trim() ?? "",
    descricaoCompleta: caso?.textos?.descricao_completa?.trim() ?? "",
    anexo: caso?.textos?.anexo?.trim() ?? "",
    usuarioAbertura: caso?.usuarios?.abertura?.nome?.trim() ?? "",
    relator: caso?.usuarios?.relator?.nome?.trim() ?? "",
  };
}

export function formatCasoCommitCopy(
  viewModel: CasoAbertoPlayerViewModel,
): string {
  return `${viewModel.casoId} - ${viewModel.descricaoResumo}`;
}

export function formatCasoTextoCompletoCopy(
  viewModel: CasoAbertoPlayerViewModel,
): string {
  return [
    `Produto: ${viewModel.produtoNome} - ${viewModel.produtoVersao}`,
    `ID: ${viewModel.casoId}`,
    `Usuário de Abertura: ${viewModel.usuarioAbertura}`,
    `Relator: ${viewModel.relator}`,
    "",
    viewModel.descricaoResumo,
    "",
    viewModel.descricaoCompleta,
    "",
    viewModel.anexo,
  ].join("\n");
}

/** Copia texto no contexto da janela informada (útil para Document PiP). */
export async function copyTextToClipboard(
  text: string,
  targetWindow: Window = window,
): Promise<void> {
  const clipboard = targetWindow.navigator?.clipboard;
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text);
      return;
    } catch {
      // Fallback abaixo (comum em Document Picture-in-Picture).
    }
  }

  const doc = targetWindow.document;
  const textarea = doc.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  doc.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const copied = doc.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Não foi possível copiar o texto.");
  }
}
