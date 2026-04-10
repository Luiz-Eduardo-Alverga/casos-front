"use client";

import { useState, useEffect, useMemo } from "react";
import { User } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/caso-form/provider";
import { useFormContext } from "react-hook-form";
import { useUsuariosProjetos } from "@/hooks/use-usuarios";
import type { Usuario } from "@/services/auxiliar/usuarios";

export interface CasoFormDevAtribuidoProps {
  /** Nome do campo no react-hook-form (ex.: `usuario_dev_id` nos filtros). */
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  /** Se false, o campo permanece habilitado sem produto selecionado (filtros). */
  requireProduto?: boolean;
}

export function CasoFormDevAtribuido({
  name = "devAtribuido",
  label = "Dev Atribuído",
  placeholder = "Selecione o dev atribuído...",
  required = true,
  requireProduto = true,
}: CasoFormDevAtribuidoProps = {}) {
  const { produto, isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { watch } = useFormContext();
  const devAtribuido = watch(name);
  const produtoValue = watch("produto");
  const [optionsRequested, setOptionsRequested] = useState(!lazyLoadComboboxOptions);
  const [devSelecionado, setDevSelecionado] = useState<Usuario | null>(null);

  const produtoAtual = produtoValue || produto;

  const { data: usuarios, isLoading: isUsuariosLoading } = useUsuariosProjetos({
    enabled: optionsRequested,
  });

  const devOptions = useMemo(() => {
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
    
    if (devAtribuido && devSelecionado) {
      const devValue = String(devSelecionado.id);
      if (!valuesAdded.has(devValue)) {
        options.unshift({ value: devValue, label: devSelecionado.nome_suporte });
        valuesAdded.add(devValue);
      }
    }

    if (lazyLoadComboboxOptions && editCaseItem?.caso?.usuarios?.desenvolvimento && devAtribuido && !valuesAdded.has(String(devAtribuido))) {
      const u = editCaseItem.caso.usuarios.desenvolvimento;
      options.unshift({ value: String(u.id), label: u.nome ?? String(u.id) });
    }

    return options;
  }, [usuarios, devAtribuido, devSelecionado, lazyLoadComboboxOptions, editCaseItem]);
  
  // Quando dev é selecionado, buscar e salvar os dados completos
  useEffect(() => {
    if (devAtribuido && usuarios && Array.isArray(usuarios)) {
      const devEncontrado = usuarios.find(
        (u) => String(u.id) === String(devAtribuido),
      );
      if (devEncontrado) {
        setDevSelecionado(devEncontrado);
      }
    } else if (!devAtribuido) {
      setDevSelecionado(null);
    }
  }, [devAtribuido, usuarios]);
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name={name}
        label={label}
        icon={User}
        options={devOptions}
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
