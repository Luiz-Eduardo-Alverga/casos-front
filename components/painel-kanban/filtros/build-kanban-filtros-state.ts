import { getUser, type User } from "@/lib/auth";
import type { PainelKanbanFiltrosForm } from "@/interfaces/kanban/painel-kanban-filtros-form";
import { readPainelKanbanFiltros } from "@/components/painel-kanban/filtros/painel-kanban-filtros-storage";

export type PainelKanbanApiFiltros = {
  devAtribuidoId: string;
  cronogramaId?: string;
};

export type PainelKanbanBootstrapResult = {
  form: PainelKanbanFiltrosForm;
  api: PainelKanbanApiFiltros;
};

export function buildKanbanFiltrosFromStorage(
  loggedUser: User | null,
  saved: Partial<PainelKanbanFiltrosForm> | null,
  fallbackColaboradorId: string,
  fallbackColaboradorNome: string,
): PainelKanbanBootstrapResult {
  const loggedId =
    loggedUser?.id != null ? String(loggedUser.id) : fallbackColaboradorId;
  const loggedNome = loggedUser?.nome
    ? String(loggedUser.nome)
    : fallbackColaboradorNome;
  const loggedSetor = loggedUser?.setor?.trim() ?? "";

  const savedDevId =
    saved?.devAtribuido != null ? String(saved.devAtribuido).trim() : "";
  const devAtribuidoId = savedDevId || loggedId;

  const projeto = saved?.projeto?.trim() ?? "";
  const projetoDataFinal = saved?.projetoDataFinal?.trim() ?? "";

  const savedDevLabel = saved?.devAtribuidoLabel?.trim() ?? "";
  const devAtribuidoLabel =
    savedDevLabel ||
    (String(devAtribuidoId) === String(loggedId) ? loggedNome : "");

  let devAtribuidoSetor = "";
  if (saved?.devAtribuidoSetor?.trim()) {
    devAtribuidoSetor = saved.devAtribuidoSetor.trim();
  } else if (
    loggedSetor &&
    String(devAtribuidoId) === String(loggedUser?.id ?? "")
  ) {
    devAtribuidoSetor = loggedSetor;
  }

  const form: PainelKanbanFiltrosForm = {
    produto: saved?.produto?.trim() ?? "",
    versao: saved?.versao?.trim() ?? "",
    devAtribuido: devAtribuidoId,
    devAtribuidoLabel,
    devAtribuidoSetor,
    projeto,
    projetoDataFinal,
  };

  const api: PainelKanbanApiFiltros = {
    devAtribuidoId,
    ...(projeto ? { cronogramaId: projeto } : {}),
  };

  return { form, api };
}

/** Bootstrap síncrono (client) para defaultValues e apiFiltros iniciais. */
export function getInitialKanbanFiltrosBootstrap(
  fallbackColaboradorId: string,
  fallbackColaboradorNome: string,
): PainelKanbanBootstrapResult {
  const loggedUser = getUser();
  const saved = readPainelKanbanFiltros();
  return buildKanbanFiltrosFromStorage(
    loggedUser,
    saved,
    fallbackColaboradorId,
    fallbackColaboradorNome,
  );
}

/** Deriva parâmetros de API a partir do estado atual do form (sem auto-resolve). */
export function apiFiltrosFromFormValues(
  values: Pick<PainelKanbanFiltrosForm, "devAtribuido" | "projeto">,
  fallbackDevId: string,
): PainelKanbanApiFiltros {
  const devAtribuidoId = values.devAtribuido?.trim() || fallbackDevId;
  const projeto = values.projeto?.trim() ?? "";
  return {
    devAtribuidoId,
    ...(projeto ? { cronogramaId: projeto } : {}),
  };
}
