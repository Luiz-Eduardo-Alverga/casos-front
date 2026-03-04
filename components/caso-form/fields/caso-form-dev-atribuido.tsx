"use client";

import { useState, useEffect, useMemo } from "react";
import { User } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "../provider";
import { useFormContext } from "react-hook-form";
import { useUsuarios } from "@/hooks/use-usuarios";
import type { Usuario } from "@/services/auxiliar/usuarios";

export function CasoFormDevAtribuido() {
  const { produto, isDisabled } = useCasoForm();
  const { watch } = useFormContext();
  const devAtribuido = watch("devAtribuido");
  const produtoValue = watch("produto");
  // const [usuariosSearch, setUsuariosSearch] = useState<string>("");
  const [devSelecionado, setDevSelecionado] = useState<Usuario | null>(null);
  
  const produtoAtual = produtoValue || produto;
  
  const { data: usuarios, isLoading: isUsuariosLoading } = useUsuarios({
    // search: usuariosSearch.trim() || undefined,
  });
  
  const devOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    const valuesAdded = new Set<string>(); // Set para rastrear valores únicos
    
    // Adiciona usuários da API
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
    
    // Adiciona dev selecionado se não estiver nas opções
    if (devAtribuido && devSelecionado) {
      const devValue = devSelecionado.id;
      if (!valuesAdded.has(devValue)) {
        options.unshift({
          value: devValue,
          label: devSelecionado.nome_suporte,
        });
        valuesAdded.add(devValue);
      }
    }
    
    return options;
  }, [usuarios, devAtribuido, devSelecionado]);
  
  // Quando dev é selecionado, buscar e salvar os dados completos
  useEffect(() => {
    if (devAtribuido && usuarios && Array.isArray(usuarios)) {
      const devEncontrado = usuarios.find(u => u.id === devAtribuido);
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
        name="devAtribuido"
        label="Dev Atribuído"
        icon={User}
        options={devOptions}
        placeholder="Selecione o dev atribuído..."
        emptyText={isUsuariosLoading ? "Carregando usuários..." : "Nenhum usuário encontrado."}
        // onSearchChange={setUsuariosSearch}
        searchDebounceMs={450}
        disabled={isDisabled || !produtoAtual}
        required
      />
    </div>
  );
}
