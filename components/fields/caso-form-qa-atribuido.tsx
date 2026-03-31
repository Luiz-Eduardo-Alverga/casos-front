"use client";

import { useState, useEffect, useMemo } from "react";
import { User } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/caso-form/provider";
import { useFormContext } from "react-hook-form";
import { useUsuarios } from "@/hooks/use-usuarios";
import type { Usuario } from "@/services/auxiliar/usuarios";

export interface CasoFormQaAtribuidoProps {
  /** Nome do campo no react-hook-form (ex.: `usuario_qa_id` nos filtros). */
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  /** Se false, o campo permanece habilitado sem produto selecionado (filtros). */
  requireProduto?: boolean;
}

export function CasoFormQaAtribuido({
  name = "qaAtribuido",
  label = "QA Atribuído",
  placeholder = "Selecione o QA atribuído...",
  required = false,
  requireProduto = true,
}: CasoFormQaAtribuidoProps = {}) {
  const { produto, isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { watch } = useFormContext();
  const qaAtribuido = watch(name);
  const produtoValue = watch("produto");
  const [optionsRequested, setOptionsRequested] = useState(!lazyLoadComboboxOptions);
  const [qaSelecionado, setQaSelecionado] = useState<Usuario | null>(null);

  const produtoAtual = produtoValue || produto;

  const { data: usuarios, isLoading: isUsuariosLoading } = useUsuarios({
    enabled: optionsRequested,
  });

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

    if (lazyLoadComboboxOptions && editCaseItem?.caso?.usuarios?.qa && qaAtribuido && !valuesAdded.has(String(qaAtribuido))) {
      const u = editCaseItem.caso.usuarios.qa;
      options.unshift({ value: String(u.id), label: u.nome ?? String(u.id) });
    }

    return options;
  }, [usuarios, qaAtribuido, qaSelecionado, lazyLoadComboboxOptions, editCaseItem]);
  
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
        placeholder={placeholder}
        emptyText={isUsuariosLoading ? "Carregando usuários..." : "Nenhum usuário encontrado."}
        // onSearchChange={setUsuariosSearch}
        searchDebounceMs={450}
        disabled={isDisabled || (requireProduto && !produtoAtual)}
        required={required}
        onOpenChange={lazyLoadComboboxOptions ? (open) => open && setOptionsRequested(true) : undefined}
      />
    </div>
  );
}
