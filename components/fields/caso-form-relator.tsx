"use client";

import { useState, useEffect, useMemo } from "react";
import { User } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useRelatores } from "@/hooks/catalogos/use-usuarios";
import { getUser } from "@/lib/auth";
import type { Usuario } from "@/services/auxiliar/usuarios";

export interface CasoFormRelatorProps {
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  /** Rótulo exibido para o valor selecionado (ex.: `report.responsavel_feedback_nome`). */
  selectedLabelOverride?: string;
}

export function CasoFormRelator({
  name = "relator",
  label = "Relator",
  placeholder = "Selecione o relator...",
  required = true,
  selectedLabelOverride,
}: CasoFormRelatorProps = {}) {
  const { isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { watch } = useFormContext();
  const relator = watch(name);
  const [optionsRequested, setOptionsRequested] = useState(!lazyLoadComboboxOptions);
  const [relatorSelecionado, setRelatorSelecionado] = useState<Usuario | null>(null);

  const user = getUser();

  const { data: usuarios, isLoading: isUsuariosLoading } = useRelatores({
    enabled: optionsRequested,
  });

  const relatoresOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    const valuesAdded = new Set<string>(); // Set para rastrear valores únicos
    
    // Adiciona usuário logado (relator padrão)
    if (user) {
      const userId = user.id.toString();
      if (!valuesAdded.has(userId)) {
        options.push({
          value: userId,
          label: user.nome,
        });
        valuesAdded.add(userId);
      }
    }
    
    // Adiciona usuários da API (apenas se não foram adicionados ainda)
    if (usuarios && Array.isArray(usuarios)) {
      usuarios.forEach((u) => {
        if (!valuesAdded.has(u.id)) {
          options.push({
            value: u.id,
            label: u.nome_suporte,
          });
          valuesAdded.add(u.id);
        }
      });
    }
    
    if (relator && relatorSelecionado) {
      const relatorValue = relatorSelecionado.id;
      if (!valuesAdded.has(relatorValue)) {
        options.unshift({ value: relatorValue, label: relatorSelecionado.nome_suporte });
        valuesAdded.add(relatorValue);
      }
    }

    const relatorValue = relator ? String(relator) : "";
    const nomeEdicao =
      selectedLabelOverride?.trim() ||
      (name === "reportResponsavelSuporteId"
        ? editCaseItem?.report?.responsavel_feedback_nome?.trim()
        : undefined) ||
      editCaseItem?.caso?.usuarios?.relator?.nome?.trim();

    if (lazyLoadComboboxOptions && relatorValue && nomeEdicao) {
      const existingIdx = options.findIndex((o) => o.value === relatorValue);
      if (existingIdx >= 0) {
        options[existingIdx] = { value: relatorValue, label: nomeEdicao };
      } else if (!valuesAdded.has(relatorValue)) {
        options.unshift({ value: relatorValue, label: nomeEdicao });
        valuesAdded.add(relatorValue);
      }
    }

    return options;
  }, [
    usuarios,
    relator,
    relatorSelecionado,
    user,
    lazyLoadComboboxOptions,
    editCaseItem,
    name,
    selectedLabelOverride,
  ]);
  
  // Quando relator é selecionado, buscar e salvar os dados completos
  useEffect(() => {
    if (relator && usuarios && Array.isArray(usuarios)) {
      const relatorEncontrado = usuarios.find(u => u.id === relator);
      if (relatorEncontrado) {
        setRelatorSelecionado(relatorEncontrado);
      }
    } else if (!relator) {
      setRelatorSelecionado(null);
    }
  }, [relator, usuarios]);
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name={name}
        label={label}
        icon={User}
        options={relatoresOptions}
        placeholder={placeholder}
        emptyText={isUsuariosLoading ? "Carregando usuários..." : "Nenhum usuário encontrado."}
        // onSearchChange={setUsuariosSearch}
        searchDebounceMs={450}
        disabled={isDisabled}
        required={required}
        onOpenChange={lazyLoadComboboxOptions ? (open) => open && setOptionsRequested(true) : undefined}
      />
    </div>
  );
}
