"use client";

import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useClientes } from "@/hooks/use-clientes";
import { useFormContext, useWatch } from "react-hook-form";

interface CasoEditClienteComboboxProps {
  onClienteChange: (registro: string | undefined) => void;
}

export function CasoEditClienteCombobox({
  onClienteChange,
}: CasoEditClienteComboboxProps) {
  const { control } = useFormContext();

  const clienteSelecionado = useWatch({
    control,
    name: "clienteSelecionado",
  });

  const [clienteSearch, setClienteSearch] = useState("");

  const {
    data: clientesData,
    fetchNextPage: fetchNextClientesPage,
    hasNextPage: hasNextClientesPage,
    isFetchingNextPage: isFetchingNextClientesPage,
  } = useClientes(
    {
      search: clienteSearch,
      per_page: 50,
    },
    {
      enabled: clienteSearch.trim().length >= 2,
    },
  );

  const clientesOptions = useMemo(
    () =>
      clientesData?.pages.flatMap((page) =>
        page.data.map((cliente) => ({
          value: cliente.registro,
          label: `${cliente.registro} - ${cliente.nome}`,
        })),
      ) ?? [],
    [clientesData],
  );

  useEffect(() => {
    onClienteChange(clienteSelecionado || undefined);
  }, [clienteSelecionado, onClienteChange]);

  return (
    <ComboboxField
      name="clienteSelecionado"
      label="Cliente"
      icon={Users}
      options={clientesOptions}
      placeholder="Pesquisar cliente..."
      emptyText={
        clienteSearch.trim().length < 2
          ? "Digite pelo menos 2 caracteres para pesquisar."
          : "Nenhum cliente encontrado."
      }
      onSearchChange={setClienteSearch}
      searchDebounceMs={400}
      hasMore={Boolean(hasNextClientesPage)}
      isLoadingMore={isFetchingNextClientesPage}
      onLoadMore={() => {
        if (hasNextClientesPage && !isFetchingNextClientesPage) {
          fetchNextClientesPage();
        }
      }}
    />
  );
}
