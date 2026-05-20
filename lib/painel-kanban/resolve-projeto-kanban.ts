import type { Projeto } from "@/services/auxiliar/projetos";

export function parseLocalDateYmd(
  value: string | null | undefined,
): Date | null {
  if (!value?.trim()) return null;
  const s = value.trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const [, y, mo, d] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d), 0, 0, 0, 0);
}

export function startOfTodayLocal(): Date {
  const hoje = new Date();
  return new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate(),
    0,
    0,
    0,
    0,
  );
}

export function isHojeDepoisDe(dataFinalSalva: string | undefined): boolean {
  const df = parseLocalDateYmd(dataFinalSalva);
  if (!df) return true;
  return startOfTodayLocal().getTime() > df.getTime();
}

export function setoresIguais(a: string | undefined, b: string | undefined): boolean {
  const na = String(a ?? "").trim().toLowerCase();
  const nb = String(b ?? "").trim().toLowerCase();
  return na !== "" && na === nb;
}

export function isProjetoVigenteHoje(
  projeto: Projeto,
  hoje: Date = startOfTodayLocal(),
): boolean {
  const di = parseLocalDateYmd(projeto.data_inicial);
  const df = parseLocalDateYmd(projeto.data_final);
  if (!di || !df) return false;
  const t = hoje.getTime();
  return di.getTime() <= t && t <= df.getTime();
}

export function resolveProjetoKanban(
  projetos: Projeto[],
  setorUsuario: string,
): Projeto | null {
  const setor = setorUsuario.trim();
  if (!setor) return null;

  const hoje = startOfTodayLocal();
  const candidatos = projetos
    .filter(
      (p) => setoresIguais(p.setor, setor) && isProjetoVigenteHoje(p, hoje),
    )
    .map((p) => ({
      p,
      di: parseLocalDateYmd(p.data_inicial),
    }))
    .filter((x): x is { p: Projeto; di: Date } => x.di !== null);

  if (candidatos.length === 0) return null;

  candidatos.sort((a, b) => b.di.getTime() - a.di.getTime());
  return candidatos[0].p;
}

export function findProjetoById(
  projetos: Projeto[],
  id: string,
): Projeto | undefined {
  const normalized = id.trim();
  if (!normalized) return undefined;
  return projetos.find((p) => String(p.id) === normalized);
}
