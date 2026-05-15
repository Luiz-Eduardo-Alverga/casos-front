"use client";

import { useState, useEffect, useMemo } from "react";
import { User } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useUsuariosProjetos } from "@/hooks/catalogos/use-usuarios";
import { getUser } from "@/lib/auth";
import type { Usuario } from "@/services/auxiliar/usuarios";

export interface CasoFormDevAtribuidoProps {
  /** Nome do campo no react-hook-form (ex.: `usuario_dev_id` nos filtros). */
  name?: string;
  /** Nome do campo (opcional) para persistir o label do usuário selecionado. */
  labelName?: string;
  /** Nome do campo (opcional) para persistir o setor do usuário selecionado. */
  setorName?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  /** Se false, o campo permanece habilitado sem produto selecionado (filtros). */
  requireProduto?: boolean;
  /** Esconde o label externo do campo (uso em headers compactos). */
  hideLabel?: boolean;
  /** Classe opcional para o container do campo. */
  wrapperClassName?: string;
  /** Classe de altura aplicada ao combobox e ao botão de limpar. */
  controlHeightClassName?: string;
  /** Prefixo exibido apenas no gatilho quando há valor selecionado. */
  valueLabelPrefix?: string;
}

export function CasoFormDevAtribuido({
  name = "devAtribuido",
  labelName = "devAtribuidoLabel",
  setorName,
  label = "Dev Atribuído",
  placeholder = "Selecione o dev atribuído...",
  required = true,
  requireProduto = true,
  hideLabel = false,
  wrapperClassName,
  controlHeightClassName,
  valueLabelPrefix,
}: CasoFormDevAtribuidoProps = {}) {
  const { produto, isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { watch, setValue, getValues } = useFormContext();
  const devAtribuido = watch(name);
  const devAtribuidoLabel = watch(labelName);
  const produtoValue = watch("produto");
  const [optionsRequested, setOptionsRequested] = useState(!lazyLoadComboboxOptions);
  const [devSelecionado, setDevSelecionado] = useState<Usuario | null>(null);

  const user = getUser();

  const produtoAtual = produtoValue || produto;

  const { data: usuarios, isLoading: isUsuariosLoading } = useUsuariosProjetos({
    enabled: optionsRequested,
  });

  const devOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    const valuesAdded = new Set<string>(); // Set para rastrear valores únicos

    // Seed: quando o valor vem persistido (ex.: localStorage) mas as opções são lazy-loaded,
    // injeta a opção com o label salvo para o Combobox conseguir renderizar o texto no F5.
    if (devAtribuido?.toString().trim() && devAtribuidoLabel?.toString().trim()) {
      const seedValue = String(devAtribuido);
      if (!valuesAdded.has(seedValue)) {
        options.unshift({
          value: seedValue,
          label: String(devAtribuidoLabel),
        });
        valuesAdded.add(seedValue);
      }
    }

    // Adiciona usuário logado (dev padrão / "ver como" com valor inicial)
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
        options.unshift({
          value: devValue,
          label: devSelecionado.nome_suporte,
        });
        valuesAdded.add(devValue);
      }
    }

    if (lazyLoadComboboxOptions && editCaseItem?.caso?.usuarios?.desenvolvimento && devAtribuido && !valuesAdded.has(String(devAtribuido))) {
      const u = editCaseItem.caso.usuarios.desenvolvimento;
      options.unshift({
        value: String(u.id),
        label: String(u.nome ?? String(u.id)),
      });
    }

    return options;
  }, [
    usuarios,
    devAtribuido,
    devAtribuidoLabel,
    devSelecionado,
    user,
    lazyLoadComboboxOptions,
    editCaseItem,
  ]);
  
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

  // Mantém o setor do usuário sincronizado no form (quando solicitado).
  useEffect(() => {
    if (!setorName) return;

    const currentId = devAtribuido?.toString().trim();
    if (!currentId) {
      const currentSetor = String(getValues(setorName as any) ?? "");
      if (currentSetor !== "") {
        setValue(setorName as any, "", {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
      return;
    }

    const setSetorIfChanged = (nextSetor: string) => {
      const currentSetor = String(getValues(setorName as any) ?? "");
      if (currentSetor !== nextSetor) {
        setValue(setorName as any, nextSetor, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    };

    // Preferência: dados completos encontrados via API.
    if (devSelecionado && String(devSelecionado.id) === String(currentId)) {
      setSetorIfChanged(String(devSelecionado.setor ?? ""));
      return;
    }

    // Se o usuário veio do editCaseItem (tela de edição).
    const editDev = editCaseItem?.caso?.usuarios?.desenvolvimento;
    if (editDev && String(editDev.id) === String(currentId)) {
      // Nem sempre o editCaseItem tem setor; não força valor nesse caso.
      return;
    }

    // Se não achou ainda, tenta inferir via lista carregada.
    if (usuarios && Array.isArray(usuarios)) {
      const devEncontrado = usuarios.find((u) => String(u.id) === String(currentId));
      if (devEncontrado) {
        setSetorIfChanged(String(devEncontrado.setor ?? ""));
      }
    }
  }, [devAtribuido, devSelecionado, editCaseItem, getValues, setValue, setorName, usuarios]);

  // Mantém o label sincronizado no form (para persistência/restauração).
  useEffect(() => {
    const currentId = devAtribuido?.toString().trim();
    if (!currentId) {
      const currentLabel = String(getValues(labelName as any) ?? "");
      if (currentLabel !== "") {
        setValue(labelName as any, "", {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
      return;
    }

    const setLabelIfChanged = (nextLabel: string) => {
      const currentLabel = String(getValues(labelName as any) ?? "");
      if (currentLabel !== nextLabel) {
        setValue(labelName as any, nextLabel, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    };

    // 1) Se é o usuário logado.
    if (user && String(user.id) === String(currentId)) {
      setLabelIfChanged(String(user.nome ?? ""));
      return;
    }

    // 2) Se já achou via API.
    if (devSelecionado && String(devSelecionado.id) === String(currentId)) {
      setLabelIfChanged(String(devSelecionado.nome_suporte ?? ""));
      return;
    }

    // 3) Se veio do editCaseItem (tela de edição).
    const editDev = editCaseItem?.caso?.usuarios?.desenvolvimento;
    if (editDev && String(editDev.id) === String(currentId)) {
      setLabelIfChanged(String(editDev.nome ?? ""));
    }
  }, [devAtribuido, devSelecionado, editCaseItem, getValues, labelName, setValue, user]);
  
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
        hideLabel={hideLabel}
        wrapperClassName={wrapperClassName}
        controlHeightClassName={controlHeightClassName}
        valueLabelPrefix={valueLabelPrefix}
      />
    </div>
  );
}
