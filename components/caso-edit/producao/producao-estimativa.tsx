"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TamanhoCombobox } from "../fields/tamanho-combobox";
import { buildTempoEstimadoParaApi, maskHHMM } from "./utils";
import type { AbaProducaoSavePayload } from "./types";
import { NaoPlanejadoField } from "./nao-planejado-field";

export interface ProducaoEstimativaProps {
  showForm: boolean;
  setShowForm: (open: boolean) => void;
  isSaving: boolean;

  naoPlanejado: boolean;
  setNaoPlanejado: (v: boolean) => void;
  naoPlanejadoFlag: boolean;

  tamanhoId: string;
  setTamanhoId: (v: string) => void;
  tempoEstimado: string;
  setTempoEstimado: (v: string) => void;

  estimadoMin: number;
  onSaveProducao: (payload: AbaProducaoSavePayload) => Promise<void>;
}

export function ProducaoEstimativa({
  showForm,
  setShowForm,
  isSaving,
  naoPlanejado,
  setNaoPlanejado,
  naoPlanejadoFlag,
  tamanhoId,
  setTamanhoId,
  tempoEstimado,
  setTempoEstimado,
  estimadoMin,
  onSaveProducao,
}: ProducaoEstimativaProps) {
  const handleSalvar = async () => {
    const payload: AbaProducaoSavePayload = {
      NaoPlanejado: naoPlanejado ? 1 : 0,
      TempoEstimado: naoPlanejado
        ? null
        : buildTempoEstimadoParaApi(tempoEstimado),
      tamanho: naoPlanejado ? null : tamanhoId ? Number(tamanhoId) : null,
    };
    await onSaveProducao(payload);
    setShowForm(false);
  };

  return (
    <div className="shrink-0 p-5 rounded-lg border border-border-divider bg-muted/30 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Lançar estimativa
          </h3>
          <p className="text-sm text-text-secondary">
            Registre uma estimativa de tempo para o caso
          </p>
        </div>
        {!showForm ? (
          <Button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto shrink-0"
          >
            {estimadoMin ? "Alterar estimativa" : "Lançar estimativa"}
          </Button>
        ) : null}
      </div>

      {showForm && (
        <>
          <NaoPlanejadoField
            checked={naoPlanejado}
            onCheckedChange={setNaoPlanejado}
            disabled={isSaving}
          />

          {!naoPlanejado && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TamanhoCombobox
                value={tamanhoId}
                onValueChange={(v) => setTamanhoId(v ?? "")}
                onTamanhoSelect={(_id, tempoHHMM) =>
                  setTempoEstimado(tempoHHMM)
                }
                disabled={isSaving}
              />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label
                    htmlFor="tempo-estimado"
                    className="text-sm font-medium text-text-label"
                  >
                    Tempo estimado
                  </Label>
                </div>
                <Input
                  id="tempo-estimado"
                  type="text"
                  placeholder="HH:MM (ex: 01:30)"
                  value={tempoEstimado}
                  onChange={(e) => setTempoEstimado(maskHHMM(e.target.value))}
                  disabled={isSaving}
                  maxLength={5}
                  className="h-9 rounded-lg border-border-input px-[17px] py-3"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setNaoPlanejado(naoPlanejadoFlag);
                setShowForm(false);
              }}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSalvar} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
