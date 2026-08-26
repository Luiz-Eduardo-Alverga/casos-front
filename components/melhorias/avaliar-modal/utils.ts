/** Formata data civil para a API: `YYYY-MM-DD 00:00:00`. */
export function formatDataAprovado(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day} 00:00:00`;
}

export function formatHojeDisplay(date = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}
