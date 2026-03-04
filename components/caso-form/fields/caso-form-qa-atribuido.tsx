"use client";

import { useState, useEffect, useMemo } from "react";
import { User } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "../provider";
import { useFormContext } from "react-hook-form";
import { useUsuarios } from "@/hooks/use-usuarios";
import type { Usuario } from "@/services/auxiliar/usuarios";

export function CasoFormQaAtribuido() {
  const { produto, isDisabled } = useCasoForm();
  const { watch } = useFormContext();
  const qaAtribuido = watch("qaAtribuido");
  const produtoValue = watch("produto");
  // const [usuariosSearch, setUsuariosSearch] = useState<string>("");
  const [qaSelecionado, setQaSelecionado] = useState<Usuario | null>(null);
  
  const produtoAtual = produtoValue || produto;
  
  const { data: usuarios, isLoading: isUsuariosLoading } = useUsuarios({
    // search: usuariosSearch.trim() || undefined,
  });
  
  const qasOptions = useMemo(() => {
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
    
    // Adiciona QA selecionado se não estiver nas opções
    if (qaAtribuido && qaSelecionado) {
      const qaValue = qaSelecionado.id;
      if (!valuesAdded.has(qaValue)) {
        options.unshift({
          value: qaValue,
          label: qaSelecionado.nome_suporte,
        });
        valuesAdded.add(qaValue);
      }
    }
    
    return options;
  }, [usuarios, qaAtribuido, qaSelecionado]);
  
  // Quando QA é selecionado, buscar e salvar os dados completos
  useEffect(() => {
    if (qaAtribuido && usuarios && Array.isArray(usuarios)) {
      const qaEncontrado = usuarios.find(u => u.id === qaAtribuido);
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
        name="qaAtribuido"
        label="QA Atribuído"
        icon={User}
        options={qasOptions}
        placeholder="Selecione o QA atribuído..."
        emptyText={isUsuariosLoading ? "Carregando usuários..." : "Nenhum usuário encontrado."}
        // onSearchChange={setUsuariosSearch}
        searchDebounceMs={450}
        disabled={isDisabled || !produtoAtual}
      />
    </div>
  );
}
