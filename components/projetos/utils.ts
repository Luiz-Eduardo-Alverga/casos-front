/** Converte data da API SGP ("YYYY-MM-DD HH:mm:ss") para dd/MM/yyyy sem fuso. */
export function formatSgpDateTimeToPt(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  const datePart = value.trim().split(/\s+/)[0] ?? "";
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return "—";
  return `${day}/${month}/${year}`;
}
