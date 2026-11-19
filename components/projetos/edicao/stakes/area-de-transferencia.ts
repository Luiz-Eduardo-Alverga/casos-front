/**
 * Copia texto para a área de transferência (decisão #24): Clipboard API em contexto seguro e,
 * se não der (Softflow sem HTTPS, permissão negada), `execCommand("copy")` com um textarea oculto.
 */
export async function copiarParaAreaDeTransferencia(texto: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // cai na reserva abaixo
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = texto;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  const focoAnterior = document.activeElement as HTMLElement | null;
  textarea.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
    focoAnterior?.focus?.();
  }
}
