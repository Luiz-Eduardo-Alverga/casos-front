"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, FolderKanban, Info, Loader2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useSgpCadastros } from "@/hooks/projetos/use-sgp-cadastros";
import { useSgpStakesTodos } from "@/hooks/projetos/use-sgp-stakes-todos";
import { cn } from "@/lib/utils";
import {
  lerTsv,
  marcarBloqueios,
  stakesParaImportadas,
} from "@/components/projetos/edicao/stakes/stakes-lista-utils";
import type {
  StakeLinha,
  StakeLinhaImportada,
  StakesCatalogos,
} from "@/components/projetos/edicao/stakes/stakes-lista.types";

export type ModoImportar = "projeto" | "colar";

const EXPLICACAO_COLAR =
  "Uma linha por pessoa, colunas separadas por tabulação (como sai do Excel, do Access ou do \"Copiar linhas\"): Função, Colaborador, Planejada, Não planejada, Dias e Observação. O cabeçalho é opcional; horas como 6, 6:00 ou 6h30.";

export interface StakesImportarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Modo ao abrir: botão Importar abre em "projeto"; Ctrl+V abre em "colar" (decisão #25). */
  modoInicial: ModoImportar;
  /** Texto colado que abriu o modal (modo "colar"). */
  textoInicial?: string;
  projetoId: number | string;
  setorProjeto?: string;
  catalogos: StakesCatalogos;
  /** Linhas atuais do projeto, para bloquear repetidos (decisão #20). */
  linhasDoProjeto: StakeLinha[];
  onImportar: (linhas: StakeLinha[]) => void;
}

function resumoHoras(linha: StakeLinha): string {
  const dias = linha.dias ? `${linha.dias} ${linha.dias === "1" ? "dia" : "dias"}` : "— dias";
  const base = `${linha.planejada || "—"} + ${linha.naoPlanejada || "—"} por dia × ${dias}`;
  return linha.observacao ? `${base} · ${linha.observacao}` : base;
}

export function StakesImportarModal({
  open,
  onOpenChange,
  modoInicial,
  textoInicial = "",
  projetoId,
  setorProjeto,
  catalogos,
  linhasDoProjeto,
  onImportar,
}: StakesImportarModalProps) {
  const [modo, setModo] = useState<ModoImportar>(modoInicial);
  const [texto, setTexto] = useState(textoInicial);
  const [projetoOrigem, setProjetoOrigem] = useState("");
  const [selecionados, setSelecionados] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    if (!open) return;
    setModo(modoInicial);
    setTexto(textoInicial);
    if (modoInicial === "colar") setProjetoOrigem("");
  }, [open, modoInicial, textoInicial]);

  const setor = setorProjeto?.trim() ?? "";
  const projetosQuery = useSgpCadastros(
    { setor, per_page: 1000 },
    { enabled: open && modo === "projeto" && Boolean(setor) },
  );
  const projetoOptions = useMemo(
    () =>
      (projetosQuery.data?.data ?? [])
        .filter((p) => String(p.registro) !== String(projetoId))
        .sort((a, b) => b.registro - a.registro)
        .map((p) => ({
          value: String(p.registro),
          label: `#${p.registro} ${p.nome_projeto}${p.status === "FECHADO" ? " (Fechado)" : ""}`,
        })),
    [projetosQuery.data?.data, projetoId],
  );

  const stakesOrigemQuery = useSgpStakesTodos(projetoOrigem || null, {
    enabled: open && modo === "projeto" && Boolean(projetoOrigem),
  });

  const importadas: StakeLinhaImportada[] = useMemo(() => {
    const base =
      modo === "projeto"
        ? stakesParaImportadas(stakesOrigemQuery.data ?? [], catalogos)
        : lerTsv(texto, catalogos);
    return marcarBloqueios(base, linhasDoProjeto);
  }, [modo, stakesOrigemQuery.data, texto, catalogos, linhasDoProjeto]);

  // Seleção padrão: tudo que não está bloqueado.
  useEffect(() => {
    setSelecionados(new Set(importadas.filter((i) => !i.bloqueio).map((i) => i.numero)));
  }, [importadas]);

  const bloqueadas = importadas.filter((i) => i.bloqueio).length;
  const escolhidas = importadas.filter((i) => !i.bloqueio && selecionados.has(i.numero));

  const alternar = (numero: number, marcado: boolean) => {
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      if (marcado) proximo.add(numero);
      else proximo.delete(numero);
      return proximo;
    });
  };

  const handleImportar = () => {
    if (escolhidas.length === 0) return;
    onImportar(escolhidas.map((i) => i.linha));
  };

  const carregandoPrevia = modo === "projeto" && Boolean(projetoOrigem) && stakesOrigemQuery.isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[640px] min-w-0 overflow-y-auto p-0">
        <DialogTitle className="sr-only">Importar stakeholders</DialogTitle>
        <div className="flex flex-col rounded-lg bg-card">
          <div className="border-b border-border-divider px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
                <Upload className="size-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-text-primary">Importar stakeholders</h3>
                <p className="text-xs text-text-secondary">
                  As linhas escolhidas entram como novas e só são gravadas no Salvar.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-6 pb-6 pt-4">
            <div role="tablist" className="flex gap-1 rounded-full bg-muted p-1">
              {(
                [
                  ["projeto", "De outro projeto"],
                  ["colar", "Colar linhas"],
                ] as const
              ).map(([valor, rotulo]) => (
                <button
                  key={valor}
                  type="button"
                  role="tab"
                  aria-selected={modo === valor}
                  onClick={() => setModo(valor)}
                  className={cn(
                    "flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    modo === valor
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {rotulo}
                </button>
              ))}
            </div>

            {modo === "projeto" ? (
              <div className="space-y-1">
                <ComboboxField
                  label="Projeto de origem"
                  icon={FolderKanban}
                  options={projetoOptions}
                  value={projetoOrigem}
                  onValueChange={(v) => setProjetoOrigem(v ?? "")}
                  placeholder="Escolha o projeto..."
                  emptyText="Nenhum projeto encontrado."
                  isLoading={projetosQuery.isLoading}
                  disabled={!setor}
                />
                <p className="text-xs text-text-secondary">
                  {setor
                    ? `Só aparecem projetos do setor ${setor}.`
                    : "O projeto aberto não tem setor; não há projetos para importar."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="stakes-colar" className="text-sm font-medium text-text-label">
                  Linhas copiadas
                </Label>
                <Textarea
                  id="stakes-colar"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={6}
                  placeholder={"DEV\tFulano\t06:00\t02:00\t10"}
                  className="font-mono text-xs"
                />
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{EXPLICACAO_COLAR}</p>
                </div>
              </div>
            )}

            {carregandoPrevia ? (
              <div className="flex items-center gap-2 py-4 text-sm text-text-secondary">
                <Loader2 className="size-4 animate-spin" />
                Carregando stakeholders do projeto...
              </div>
            ) : stakesOrigemQuery.isError && modo === "projeto" ? (
              <p className="text-sm text-destructive">
                Erro ao carregar os stakeholders do projeto de origem.
              </p>
            ) : importadas.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-text-secondary">
                  {escolhidas.length} de {importadas.length} linhas selecionadas
                  {bloqueadas > 0
                    ? ` · ${bloqueadas} ${bloqueadas === 1 ? "repetida bloqueada" : "repetidas bloqueadas"}`
                    : ""}
                </p>
                <ul className="max-h-[280px] divide-y divide-border-divider overflow-y-auto rounded-lg border border-border-divider">
                  {importadas.map((item) => {
                    const id = `importar-${item.numero}`;
                    const funcao = catalogos.tipos.get(Number(item.linha.idTipo)) ?? "—";
                    const colaborador = item.linha.colaboradorLabel || "—";
                    return (
                      <li key={id} className="flex items-start gap-2 px-4 py-2">
                        <Checkbox
                          id={id}
                          className="mt-0.5"
                          checked={!item.bloqueio && selecionados.has(item.numero)}
                          disabled={Boolean(item.bloqueio)}
                          onCheckedChange={(c) => alternar(item.numero, Boolean(c))}
                        />
                        <label htmlFor={id} className="min-w-0 flex-1 space-y-0.5">
                          <span
                            className={cn(
                              "block text-sm font-medium text-text-primary",
                              item.bloqueio && "text-text-secondary",
                            )}
                          >
                            {funcao} · {colaborador}
                          </span>
                          <span className="block text-xs text-text-secondary">
                            {resumoHoras(item.linha)}
                          </span>
                          {item.bloqueio ? (
                            <span className="block text-xs font-medium text-text-secondary">
                              {item.bloqueio}
                            </span>
                          ) : item.problema ? (
                            <span className="flex items-center gap-1 text-xs text-destructive">
                              <AlertTriangle className="size-3" />
                              {item.problema}
                            </span>
                          ) : null}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : modo === "projeto" && projetoOrigem ? (
              <p className="text-sm text-text-secondary">Esse projeto não tem stakeholders.</p>
            ) : null}
          </div>

          <div className="border-t border-border-divider px-6 py-4">
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={escolhidas.length === 0}
                onClick={handleImportar}
              >
                <Upload className="mr-2 size-4" />
                {escolhidas.length === 1
                  ? "Importar 1 linha"
                  : `Importar ${escolhidas.length} linhas`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
