"use client";

import { AbaCasosVersao as AbaCasosVersaoFeature } from "@/components/liberacoes/edicao/casos-versao";
import type { LiberacaoVersao } from "@/interfaces/liberacao";

export interface AbaCasosVersaoProps {
  registro: number | string;
  versoes: LiberacaoVersao[];
  enabled?: boolean;
}

export function AbaCasosVersao(props: AbaCasosVersaoProps) {
  return <AbaCasosVersaoFeature {...props} />;
}
