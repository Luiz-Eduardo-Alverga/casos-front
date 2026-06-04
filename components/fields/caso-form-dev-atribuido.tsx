"use client";

import { useState, useEffect, useMemo } from "react";
import { User } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useUsuariosProjetos } from "@/hooks/catalogos/use-usuarios";
import { getUser } from "@/lib/auth";
import {
  REPORT_DEV_631_DISPLAY_NAME,
  REPORT_DEV_631_ID,
} from "@/lib/report/apply-dev-631-form";
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
  /** Desabilita o campo independentemente do contexto do provider. */
  disabled?: boolean;
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
  disabled,
}: CasoFormDevAtribuidoProps = {}) {
  const { produto, isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { watch, setValue, getValues } = useFormContext();
  const devAtribuido = watch(name);
  const devAtribuidoLabel = watch(labelName);
  const produtoValue = watch("produto");
  const devAtribuidoValue = String(devAtribuido ?? "").trim();
  const [optionsRequested, setOptionsRequested] = useState(
    !lazyLoadComboboxOptions || Boolean(devAtribuidoValue),
  );
  const [devSelecionado, setDevSelecionado] = useState<Usuario | null>(null);

  const user = getUser();

  const produtoAtual = produtoValue || produto;

  const { data: usuarios, isLoading: isUsuariosLoading } = useUsuariosProjetos({
    enabled: optionsRequested,
  });

  useEffect(() => {
    if (!lazyLoadComboboxOptions) return;
    if (optionsRequested) return;

    const hasValue = Boolean(String(devAtribuido ?? "").trim());
    if (hasValue) setOptionsRequested(true);
  }, [devAtribuido, lazyLoadComboboxOptions, optionsRequested]);

  useEffect(() => {
    if (String(devAtribuido ?? "").trim() === REPORT_DEV_631_ID) {
      setOptionsRequested(true);
    }
  }, [devAtribuido]);

  const devOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    const valuesAdded = new Set<string>();

    // Seed: valor persistido (localStorage) antes das opções lazy-loaded chegarem.
    if (devAtribuidoValue) {
      const seedValue = devAtribuidoValue;
      const seedLabel =
        String(devAtribuidoLabel ?? "").trim() ||
        (seedValue === REPORT_DEV_631_ID
          ? REPORT_DEV_631_DISPLAY_NAME
          : seedValue);
      if (!valuesAdded.has(seedValue)) {
        options.unshift({
          value: seedValue,
          label: seedLabel,
        });
        valuesAdded.add(seedValue);
      }
    }

    // Usuário logado só entra na lista quando é o valor selecionado ou opções já carregadas.
    if (
      user &&
      (!lazyLoadComboboxOptions ||
        !devAtribuidoValue ||
        String(user.id) === devAtribuidoValue)
    ) {
      const userId = String(user.id);
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

    const editDev = editCaseItem?.caso?.usuarios?.desenvolvimento;
    if (
      lazyLoadComboboxOptions &&
      editDev &&
      devAtribuido &&
      String(editDev.id) === String(devAtribuido) &&
      !valuesAdded.has(String(devAtribuido))
    ) {
      options.unshift({
        value: String(editDev.id),
        label: String(editDev.nome ?? String(editDev.id)),
      });
    }

    return options;
  }, [
    usuarios,
    devAtribuido,
    devAtribuidoLabel,
    devAtribuidoValue,
    devSelecionado,
    user,
    lazyLoadComboboxOptions,
    editCaseItem,
  ]);
  
  // Quando dev é selecionado, buscar e salvar os dados completos
  useEffect(() => {
    if (!devAtribuido) {
      setDevSelecionado(null);
      return;
    }

    if (!usuarios || !Array.isArray(usuarios)) {
      if (String(devSelecionado?.id) !== String(devAtribuido)) {
        setDevSelecionado(null);
      }
      return;
    }

    const devEncontrado = usuarios.find(
      (u) => String(u.id) === String(devAtribuido),
    );
    if (devEncontrado) {
      setDevSelecionado(devEncontrado);
    } else if (String(devSelecionado?.id) !== String(devAtribuido)) {
      setDevSelecionado(null);
    }
  }, [devAtribuido, devSelecionado?.id, usuarios]);

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

    const currentLabel = String(getValues(labelName as any) ?? "").trim();
    const editDev = editCaseItem?.caso?.usuarios?.desenvolvimento;

    // Preserva label do caso carregado apenas quando o id ainda é o mesmo.
    if (
      currentLabel &&
      user &&
      String(user.id) !== String(currentId) &&
      !devSelecionado &&
      editDev &&
      String(editDev.id) === String(currentId)
    ) {
      setLabelIfChanged(String(editDev.nome ?? ""));
      return;
    }

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

    // 3) Se veio do editCaseItem (tela de edição) e o id coincide.
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
        disabled={
          isDisabled || Boolean(disabled) || (requireProduto && !produtoAtual)
        }
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
