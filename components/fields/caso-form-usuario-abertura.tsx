"use client";

import { useMemo, useState } from "react";
import { User } from "lucide-react";

import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/caso-form/provider";
import { useUsuarios } from "@/hooks/use-usuarios";

interface CasoFormUsuarioAberturaProps {
  required?: boolean;
}

export function CasoFormUsuarioAbertura({
  required = true,
}: CasoFormUsuarioAberturaProps) {
  const { isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const [optionsRequested, setOptionsRequested] = useState(
    !lazyLoadComboboxOptions,
  );

  const { data: usuarios, isLoading: isUsuariosLoading } = useUsuarios({
    enabled: optionsRequested,
  });

  const usuarioOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];

    if (usuarios && Array.isArray(usuarios)) {
      usuarios.forEach((u) => {
        options.push({
          value: u.id,
          label: u.nome_suporte,
        });
      });
    }

    if (
      lazyLoadComboboxOptions &&
      editCaseItem?.caso?.usuarios?.abertura &&
      !options.some((o) => o.value === String(editCaseItem.caso.usuarios.abertura?.id))
    ) {
      const u = editCaseItem.caso.usuarios.abertura;
      options.unshift({ value: String(u.id), label: u.nome ?? String(u.id) });
    }

    return options;
  }, [usuarios, lazyLoadComboboxOptions, editCaseItem]);

  return (
    <div className="space-y-2">
      <ComboboxField
        name="usuario_abertura_id"
        label="Aberto por"
        icon={User}
        options={usuarioOptions}
        placeholder="Quem abriu o caso..."
        emptyText={isUsuariosLoading ? "Carregando usuários..." : "Nenhum usuário encontrado."}
        searchDebounceMs={450}
        disabled={isDisabled}
        required={required}
        onOpenChange={
          lazyLoadComboboxOptions
            ? (open) => open && setOptionsRequested(true)
            : undefined
        }
      />
    </div>
  );
}

