"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { User } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import {
  resolveComboboxLazyLoad,
  useCasoForm,
} from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useUsuariosProjetos } from "@/hooks/catalogos/use-usuarios";
import type { Usuario } from "@/services/auxiliar/usuarios";

export interface CasoFormQaAtribuidoProps {
  /** Nome do campo no react-hook-form (ex.: `usuario_qa_id` nos filtros). */
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  /** Se false, o campo permanece habilitado sem produto selecionado (filtros). */
  requireProduto?: boolean;
  /** Se true, exige projeto selecionado para habilitar e filtra usuários pelo projeto. */
  requireProjeto?: boolean;
  /** Nome do campo de projeto no react-hook-form. Padrão: `projeto`. */
  projetoFieldName?: string;
}

export function CasoFormQaAtribuido({
  name = "qaAtribuido",
  label = "QA Atribuído",
  placeholder = "Selecione o QA atribuído...",
  required = false,
  requireProduto = true,
  requireProjeto = false,
  projetoFieldName = "projeto",
}: CasoFormQaAtribuidoProps = {}) {
  const {
    produto,
    isDisabled,
    lazyLoadComboboxOptions,
    eagerLoadComboboxFieldNames,
    editCaseItem,
  } = useCasoForm();
  const lazyLoad = resolveComboboxLazyLoad(
    { lazyLoadComboboxOptions, eagerLoadComboboxFieldNames },
    name,
  );
  const { watch, setValue } = useFormContext();
  const qaAtribuido = watch(name);
  const produtoValue = watch("produto");
  const projetoValue = watch(projetoFieldName);
  const [optionsRequested, setOptionsRequested] = useState(!lazyLoad);
  const [qaSelecionado, setQaSelecionado] = useState<Usuario | null>(null);
  const prevProjetoRef = useRef<string | undefined>(undefined);

  const produtoAtual = produtoValue || produto;
  const projetoAtual = String(projetoValue ?? "").trim();
  const projetoId = useMemo(() => {
    if (!projetoAtual) return undefined;
    const n = Number(projetoAtual);
    return Number.isFinite(n) ? n : undefined;
  }, [projetoAtual]);

  const { data: usuarios, isLoading: isUsuariosLoading } = useUsuariosProjetos({
    projeto: projetoId,
    enabled:
      optionsRequested && (!requireProjeto || Boolean(projetoId)),
  });

  useEffect(() => {
    if (!requireProjeto) return;

    const prev = prevProjetoRef.current;
    prevProjetoRef.current = projetoAtual;

    if (prev === undefined || prev === projetoAtual) return;

    setValue(name as any, "", {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setQaSelecionado(null);
  }, [projetoAtual, requireProjeto, name, setValue]);

  const qasOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    const valuesAdded = new Set<string>(); // Set para rastrear valores únicos
    
    // Adiciona usuários da API
    if (usuarios && Array.isArray(usuarios)) {
      usuarios.forEach((u) => {
        const idStr = String(u.id);
        if (!valuesAdded.has(idStr)) {
          options.push({
            value: idStr,
            label: u.nome_suporte,
          });
          valuesAdded.add(idStr);
        }
      });
    }
    
    if (qaAtribuido && qaSelecionado) {
      const qaValue = String(qaSelecionado.id);
      if (!valuesAdded.has(qaValue)) {
        options.unshift({ value: qaValue, label: qaSelecionado.nome_suporte });
        valuesAdded.add(qaValue);
      }
    }

    if (lazyLoad && editCaseItem?.caso?.usuarios?.qa && qaAtribuido && !valuesAdded.has(String(qaAtribuido))) {
      const u = editCaseItem.caso.usuarios.qa;
      options.unshift({ value: String(u.id), label: u.nome ?? String(u.id) });
    }

    return options;
  }, [usuarios, qaAtribuido, qaSelecionado, lazyLoad, editCaseItem]);
  
  // Quando QA é selecionado, buscar e salvar os dados completos
  useEffect(() => {
    if (qaAtribuido && usuarios && Array.isArray(usuarios)) {
      const qaEncontrado = usuarios.find(
        (u) => String(u.id) === String(qaAtribuido),
      );
      if (qaEncontrado) {
        setQaSelecionado(qaEncontrado);
      }
    } else if (!qaAtribuido) {
      setQaSelecionado(null);
    }
  }, [qaAtribuido, usuarios]);
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name={name}
        label={label}
        icon={User}
        options={qasOptions}
        placeholder={
          requireProjeto && !projetoAtual
            ? "Selecione o projeto primeiro."
            : placeholder
        }
        emptyText="Nenhum usuário encontrado."
        isLoading={optionsRequested && isUsuariosLoading}
        // onSearchChange={setUsuariosSearch}
        searchDebounceMs={450}
        disabled={
          isDisabled ||
          (requireProduto && !produtoAtual) ||
          (requireProjeto && !projetoAtual)
        }
        required={required}
        onOpenChange={lazyLoad ? (open) => open && setOptionsRequested(true) : undefined}
      />
    </div>
  );
}
