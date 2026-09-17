"use client";

import { BadgeCheck, Code, Users } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CasoFormRelator } from "@/components/fields/caso-form-relator";
import { CasoFormSetor } from "@/components/fields/caso-form-setor";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { ProdutoPessoaChip } from "@/components/produtos/tabela/produto-pessoa-chip";
import type { ProdutoFormData } from "@/components/produtos/cadastro/schema";

export interface ProdutoDadosFormProps {
  somenteLeitura?: boolean;
  setorLabel?: string;
  poLabel?: string;
  scrumMasterLabel?: string;
  suporteLabel?: string;
  parametrizacaoLabel?: string;
  bugsLabel?: string;
  melhoriasLabel?: string;
}

function displayValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

function CampoLeitura({
  label,
  value,
  chip = false,
  hint,
}: {
  label: string;
  value?: string | null;
  chip?: boolean;
  hint?: string;
}) {
  const text = displayValue(value);
  const showChip = chip && Boolean(value?.trim());

  return (
    <div className="min-w-0 space-y-2">
      <Label className="text-sm font-medium text-text-label">{label}</Label>
      <div className="flex min-h-9 items-center gap-2">
        {showChip ? <ProdutoPessoaChip nome={value?.trim() ?? ""} /> : (
          <p className="text-sm text-foreground">{text}</p>
        )}
      </div>
      {hint ? <p className="text-xs text-text-secondary">{hint}</p> : null}
    </div>
  );
}

export function ProdutoDadosForm({
  somenteLeitura = false,
  setorLabel,
  poLabel,
  scrumMasterLabel,
  suporteLabel,
  parametrizacaoLabel,
  bugsLabel,
  melhoriasLabel,
}: ProdutoDadosFormProps) {
  const { isDisabled } = useCasoForm();
  const { register, formState, watch } = useFormContext<ProdutoFormData>();
  const nomeError = formState.errors.nomeProjeto?.message;
  const informacoesTecnicas = watch("informacoesTecnicas") ?? "";
  const nomeProjeto = watch("nomeProjeto") ?? "";
  const showRequired = !isDisabled && !somenteLeitura;

  return (
    <>
      <Card className="rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-4 pb-2">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-3.5 w-3.5 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              {PRODUTO_LABELS.identificacao}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-2">
          {somenteLeitura ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CampoLeitura label={PRODUTO_LABELS.nome} value={nomeProjeto} />
              <CampoLeitura label={PRODUTO_LABELS.setor} value={setorLabel} />
              <CampoLeitura
                label={PRODUTO_LABELS.productOwner}
                value={poLabel}
                chip
              />
              <CampoLeitura
                label={PRODUTO_LABELS.scrumMaster}
                value={scrumMasterLabel}
                chip
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <div className="flex justify-between gap-2">
                  <Label className="text-sm font-medium text-text-label">
                    {PRODUTO_LABELS.nome}
                    {showRequired ? (
                      <>
                        {" "}
                        <span className="text-text-error">*</span>
                      </>
                    ) : null}
                  </Label>
                  {nomeError ? (
                    <p className="text-sm text-destructive">{nomeError}</p>
                  ) : null}
                </div>
                <Input
                  placeholder={PRODUTO_LABELS.nomePlaceholderCadastro}
                  className="h-9 rounded-lg border-border-input"
                  disabled={isDisabled}
                  {...register("nomeProjeto")}
                />
              </div>

              <CasoFormSetor
                name="setor"
                label={PRODUTO_LABELS.setor}
                required={showRequired}
                selectedLabelOverride={setorLabel}
              />

              <CasoFormRelator
                name="po"
                label={PRODUTO_LABELS.productOwner}
                placeholder={PRODUTO_LABELS.poPlaceholder}
                required={showRequired}
                selectedLabelOverride={poLabel}
              />

              <CasoFormRelator
                name="scrumMaster"
                label={PRODUTO_LABELS.scrumMaster}
                placeholder={PRODUTO_LABELS.smPlaceholder}
                required={showRequired}
                selectedLabelOverride={scrumMasterLabel}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-4 pb-2">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              {PRODUTO_LABELS.responsaveis}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-2">
          {somenteLeitura ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CampoLeitura
                label={PRODUTO_LABELS.responsavelSuporte}
                value={suporteLabel}
              />
              <CampoLeitura
                label={PRODUTO_LABELS.responsavelParametrizacao}
                value={parametrizacaoLabel}
              />
              <CampoLeitura
                label={PRODUTO_LABELS.responsavelBugs}
                value={bugsLabel}
                chip
              />
              <CampoLeitura
                label={PRODUTO_LABELS.responsavelMelhorias}
                value={melhoriasLabel}
                chip
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CasoFormSetor
                name="responsavelSuporte"
                label={PRODUTO_LABELS.responsavelSuporte}
                required={showRequired}
                selectedLabelOverride={suporteLabel}
              />
              <CasoFormSetor
                name="responsavelParametrizacao"
                label={PRODUTO_LABELS.responsavelParametrizacao}
                required={showRequired}
                selectedLabelOverride={parametrizacaoLabel}
              />
              <CasoFormRelator
                name="responsavelBugs"
                label={PRODUTO_LABELS.responsavelBugs}
                placeholder={PRODUTO_LABELS.colaboradorNenhum}
                required={false}
                selectedLabelOverride={bugsLabel}
              />
              <CasoFormRelator
                name="responsavelMelhorias"
                label={PRODUTO_LABELS.responsavelMelhorias}
                placeholder={PRODUTO_LABELS.colaboradorNenhum}
                required={false}
                selectedLabelOverride={melhoriasLabel}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-4 pb-2">
          <div className="flex items-center gap-2">
            <Code className="h-3.5 w-3.5 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              {PRODUTO_LABELS.informacoesTecnicas}
            </CardTitle>
            <span className="text-xs text-text-secondary">
              {PRODUTO_LABELS.opcional}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 px-6 pb-6 pt-2">
          {somenteLeitura ? (
            <p className="text-sm leading-relaxed text-foreground">
              {displayValue(informacoesTecnicas)}
            </p>
          ) : (
            <>
              <Textarea
                placeholder={PRODUTO_LABELS.tecnicasPlaceholder}
                className="min-h-32 resize-y rounded-lg border-border-input"
                disabled={isDisabled}
                {...register("informacoesTecnicas")}
              />
              <p className="text-right text-xs tabular-nums text-text-secondary">
                {informacoesTecnicas.length} caracteres
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
