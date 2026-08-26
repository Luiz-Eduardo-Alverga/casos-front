export function normalizeDocTag(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeDocTags(values: string[]): string[] {
  return [...new Set(values.map(normalizeDocTag).filter(Boolean))];
}
