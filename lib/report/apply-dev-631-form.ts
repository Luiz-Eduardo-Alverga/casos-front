export const REPORT_DEV_631_ID = "631";

/** Nome exibido no combobox enquanto o usuário 631 não está na lista da API. */
export const REPORT_DEV_631_DISPLAY_NAME = "Rubens";

export type Dev631SetValue = (
  name: string,
  value: string,
  options?: { shouldDirty?: boolean; shouldValidate?: boolean },
) => void;

export function deveAplicarDev631PorStatus(params: {
  statusCaso?: string | number | null;
  statusReport?: string | null;
}): boolean {
  const statusCaso = String(params.statusCaso ?? "").trim();
  const statusReport = String(params.statusReport ?? "").trim();
  return statusCaso === "8" || statusReport === "21";
}

const SET_OPTS = {
  shouldDirty: true,
  shouldValidate: true,
} as const;

const LABEL_SET_OPTS = {
  shouldDirty: true,
  shouldValidate: false,
} as const;

export interface ApplyDev631CasoOptions {
  /** Nome exibido no combobox; padrão {@link REPORT_DEV_631_DISPLAY_NAME}. */
  devLabel?: string;
}

/** Edição de caso/report na coluna Atribuição (`devAtribuido`). */
export function applyDev631ToCasoEditForm(
  setValue: Dev631SetValue,
  options?: ApplyDev631CasoOptions,
): void {
  setValue("devAtribuido", REPORT_DEV_631_ID, SET_OPTS);
  setValue(
    "devAtribuidoLabel",
    options?.devLabel?.trim() || REPORT_DEV_631_DISPLAY_NAME,
    LABEL_SET_OPTS,
  );
}

/** Edição dedicada de report (`reportAnaliseUsuarioId`). */
export function applyDev631ToReportEditForm(setValue: Dev631SetValue): void {
  setValue("reportAnaliseUsuarioId", REPORT_DEV_631_ID, SET_OPTS);
}

/** Coluna de status no resumo / edição (ambos os campos possíveis). */
export function applyDev631ToForm(setValue: Dev631SetValue): void {
  applyDev631ToCasoEditForm(setValue);
  applyDev631ToReportEditForm(setValue);
}
