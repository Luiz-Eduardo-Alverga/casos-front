"use client";

import { useState, useEffect, useMemo } from "react";
import { User } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "../provider";
import { useFormContext } from "react-hook-form";
import { useUsuarios } from "@/hooks/use-usuarios";
import { getUser } from "@/lib/auth";
import type { Usuario } from "@/services/auxiliar/usuarios";

export function CasoFormRelator() {
  const { isDisabled } = useCasoForm();
  const { watch } = useFormContext();
  const relator = watch("relator");
  // const [usuariosSearch, setUsuariosSearch] = useState<string>("");
  const [relatorSelecionado, setRelatorSelecionado] = useState<Usuario | null>(null);
  
  const user = getUser();
  
  const { data: usuarios, isLoading: isUsuariosLoading } = useUsuarios({
    // search: usuariosSearch.trim() || undefined,
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
    
    // Adiciona relator selecionado se não estiver nas opções
    if (relator && relatorSelecionado) {
      const relatorValue = relatorSelecionado.id;
      if (!valuesAdded.has(relatorValue)) {
        options.unshift({
          value: relatorValue,
          label: relatorSelecionado.nome_suporte,
        });
        valuesAdded.add(relatorValue);
      }
    }
    
    return options;
  }, [usuarios, relator, relatorSelecionado, user]);
  
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
        name="relator"
        label="Relator"
        icon={User}
        options={relatoresOptions}
        placeholder="Selecione o relator..."
        emptyText={isUsuariosLoading ? "Carregando usuários..." : "Nenhum usuário encontrado."}
        // onSearchChange={setUsuariosSearch}
        searchDebounceMs={450}
        disabled={isDisabled}
        required
      />
    </div>
  );
}
