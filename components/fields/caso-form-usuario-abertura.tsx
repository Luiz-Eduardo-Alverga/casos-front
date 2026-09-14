"use client";

import { useMemo, useState } from "react";
import { User } from "lucide-react";

import { ComboboxField } from "@/components/reports-form/combobox-field";
import {
  resolveComboboxLazyLoad,
  useCasoForm,
} from "@/components/fields/caso-form-provider";
import { useUsuarios } from "@/hooks/catalogos/use-usuarios";

interface CasoFormUsuarioAberturaProps {
  required?: boolean;
  name?: string;
  label?: string;
  placeholder?: string;
}

export function CasoFormUsuarioAbertura({
  required = true,
  name = "usuario_abertura_id",
  label = "Aberto por",
  placeholder = "Quem abriu o caso...",
}: CasoFormUsuarioAberturaProps) {
  const {
    isDisabled,
    lazyLoadComboboxOptions,
    eagerLoadComboboxFieldNames,
    editCaseItem,
  } = useCasoForm();
  const lazyLoad = resolveComboboxLazyLoad(
    { lazyLoadComboboxOptions, eagerLoadComboboxFieldNames },
    name,
  );
  const [optionsRequested, setOptionsRequested] = useState(!lazyLoad);

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
      lazyLoad &&
      editCaseItem?.caso?.usuarios?.abertura &&
      !options.some((o) => o.value === String(editCaseItem.caso.usuarios.abertura?.id))
    ) {
      const u = editCaseItem.caso.usuarios.abertura;
      options.unshift({ value: String(u.id), label: u.nome ?? String(u.id) });
    }

    return options;
  }, [usuarios, lazyLoad, editCaseItem]);

  return (
    <div className="space-y-2">
      <ComboboxField
        name={name}
        label={label}
        icon={User}
        options={usuarioOptions}
        placeholder={placeholder}
        emptyText="Nenhum usuário encontrado."
        isLoading={optionsRequested && isUsuariosLoading}
        searchDebounceMs={450}
        disabled={isDisabled}
        required={required}
        onOpenChange={
          lazyLoad ? (open) => open && setOptionsRequested(true) : undefined
        }
      />
    </div>
  );
}

