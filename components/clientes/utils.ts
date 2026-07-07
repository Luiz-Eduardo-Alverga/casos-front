const EMPTY_VALUE = "Não informado";

export function formatCnpj(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length !== 14) return value?.trim() || EMPTY_VALUE;
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

export function formatCpf(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length !== 11) return value?.trim() || EMPTY_VALUE;
  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

export function formatClienteDocumento(
  cnpj: string | null | undefined,
  cpf: string | null | undefined,
): string {
  const cnpjDigits = (cnpj ?? "").replace(/\D/g, "");
  if (cnpjDigits.length === 14) return formatCnpj(cnpj);

  const cpfDigits = (cpf ?? "").replace(/\D/g, "");
  if (cpfDigits.length === 11) return formatCpf(cpf);

  return cnpj?.trim() || cpf?.trim() || EMPTY_VALUE;
}

export function formatCidadeUf(
  cidade: string | null | undefined,
  uf: string | null | undefined,
): string {
  const cidadeTrimmed = cidade?.trim();
  const ufTrimmed = uf?.trim();

  if (cidadeTrimmed && ufTrimmed) return `${cidadeTrimmed} / ${ufTrimmed}`;
  return cidadeTrimmed || ufTrimmed || EMPTY_VALUE;
}

export function formatCep(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length !== 8) return value?.trim() || EMPTY_VALUE;
  return digits.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}

export function parseTelefoneResidencial(value: string | null | undefined): {
  numero: string;
  contato?: string;
} {
  const raw = value?.trim();
  if (!raw) return { numero: "" };

  const parts = raw.split(/\s{2,}/);
  const numero = parts[0]?.trim() ?? "";
  const contato = parts.slice(1).join(" ").trim();

  return {
    numero,
    contato: contato || undefined,
  };
}

export function formatTelefone(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return EMPTY_VALUE;
  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }
  return value?.trim() || EMPTY_VALUE;
}

export function parseEmails(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(";")
    .map((email) => email.trim())
    .filter(Boolean);
}

export function formatDataCadastro(value: string | null | undefined): string {
  if (!value?.trim()) return EMPTY_VALUE;
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

export function formatDataHoraAlteracao(
  value: string | null | undefined,
): string {
  if (!value?.trim()) return EMPTY_VALUE;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const data = date.toLocaleDateString("pt-BR");
  const hora = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${data} ${hora}`;
}

export function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export function buildGoogleMapsUrl(params: {
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}): string {
  const query = [
    params.endereco,
    params.bairro,
    params.cidade,
    params.uf,
    params.cep,
  ]
    .filter(Boolean)
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function displayValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed || EMPTY_VALUE;
}
