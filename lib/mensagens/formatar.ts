const MESES_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/** "Enviado 08 de Janeiro de 2025 às 14:55" (detalhe do aviso e aviso automático). */
export function formatarDataLonga(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const hora = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return `Enviado ${date.getDate()} de ${MESES_PT[date.getMonth()] ?? ""} de ${date.getFullYear()} às ${hora}`;
}

/** Iniciais do remetente para o avatar (primeira e última palavra). */
export function iniciaisRemetente(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
  return nome.slice(0, 2).toUpperCase() || "?";
}
