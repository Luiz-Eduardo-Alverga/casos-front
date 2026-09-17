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
        const usuarioId = String(u.id);
        if (!valuesAdded.has(usuarioId)) {
          options.push({
            value: usuarioId,
            label: u.nome_suporte,
          });
          valuesAdded.add(usuarioId);
        }
      });
    }

    if (relator && relatorSelecionado) {
      const relatorSelecionadoId = String(relatorSelecionado.id);
      if (!valuesAdded.has(relatorSelecionadoId)) {
        options.unshift({
          value: relatorSelecionadoId,
          label: relatorSelecionado.nome_suporte,
        });
        valuesAdded.add(relatorSelecionadoId);
      }
    }

    const relatorValue = relator ? String(relator) : "";
    const nomeEdicao =
      selectedLabelOverride?.trim() ||
      (name === "reportResponsavelSuporteId"
        ? editCaseItem?.report?.responsavel_feedback_nome?.trim()
        : undefined) ||
      (name === "relator"
        ? editCaseItem?.caso?.usuarios?.relator?.nome?.trim()
        : undefined);

    // Só injeta o rótulo salvo quando o valor ainda não está no catálogo.
    // Sobrescrever a opção atual fazia a combobox continuar mostrando o nome antigo.
    if (relatorValue && nomeEdicao && !valuesAdded.has(relatorValue)) {
      options.unshift({ value: relatorValue, label: nomeEdicao });
      valuesAdded.add(relatorValue);
    }

    return options;
  }, [
    usuarios,
    relator,
    relatorSelecionado,
    user,
    editCaseItem,
    name,
    selectedLabelOverride,
  ]);
  
  // Quando relator é selecionado, buscar e salvar os dados completos
  useEffect(() => {
    if (relator && usuarios && Array.isArray(usuarios)) {
      const relatorEncontrado = usuarios.find(
        (u) => String(u.id) === String(relator),
      );
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
        emptyText="Nenhum usuário encontrado."
        isLoading={optionsRequested && isUsuariosLoading}
        // onSearchChange={setUsuariosSearch}
        searchDebounceMs={450}
        disabled={isDisabled}
        required={required}
        onOpenChange={lazyLoadComboboxOptions ? (open) => open && setOptionsRequested(true) : undefined}
      />
    </div>
  );
}
