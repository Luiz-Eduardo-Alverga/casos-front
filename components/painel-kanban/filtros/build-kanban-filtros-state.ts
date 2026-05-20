import type { User } from "@/lib/auth";
import type { PainelKanbanFiltrosForm } from "@/interfaces/kanban/painel-kanban-filtros-form";

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

  const devAtribuidoId = saved?.devAtribuido?.trim()
    ? saved.devAtribuido.trim()
    : loggedId;

  const projeto = saved?.projeto?.trim() ?? "";
  const projetoDataFinal = saved?.projetoDataFinal?.trim() ?? "";

  let devAtribuidoLabel = loggedNome;
  if (saved?.devAtribuidoLabel?.trim()) {
    devAtribuidoLabel = saved.devAtribuidoLabel.trim();
  }

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
