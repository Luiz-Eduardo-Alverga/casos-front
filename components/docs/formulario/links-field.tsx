"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProdutos } from "@/hooks/catalogos/use-produtos";
import { useClientes } from "@/hooks/catalogos/use-clientes";
import { listAcquirersClient } from "@/services/db-api/list-cadastros";
import type { DocLinkType } from "@/services/db-api/docs";
import type { DocFormValues } from "./schema";

const labels: Record<DocLinkType, string> = {
  acquirer: "Adquirente",
  product: "Produto",
  client: "Cliente",
  case: "Caso",
};

export function LinksField() {
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<DocLinkType>("acquirer");
  const [search, setSearch] = useState("");
  const [manualLabel, setManualLabel] = useState("");
  const { watch, setValue } = useFormContext<DocFormValues>();
  const links = watch("links");
  const acquirers = useQuery({
    queryKey: ["db-acquirers", "doc-link", search],
    queryFn: () => listAcquirersClient(search),
    enabled: adding && type === "acquirer",
  });
  const products = useProdutos({
    search,
    enabled: adding && type === "product",
  });
  const clients = useClientes(
    { search, per_page: 20 },
    { enabled: adding && type === "client" },
  );

  const options = useMemo(() => {
    if (type === "acquirer") {
      return (acquirers.data ?? []).map((item) => ({
        id: item.acquirer.id,
        label: item.acquirer.name,
      }));
    }
    if (type === "product") {
      return (products.data ?? []).map((item) => ({
        id: String(item.id),
        label: item.nome_projeto,
      }));
    }
    if (type === "client") {
      return (
        clients.data?.pages.flatMap((page) =>
          page.data.map((item) => ({
            id: item.registro,
            label: item.nome || item.razao_social,
          })),
        ) ?? []
      );
    }
    return [];
  }, [acquirers.data, clients.data, products.data, type]);

  const add = (entityId: string, entityLabel: string) => {
    const key = `${type}:${entityId}`;
    if (
      links.some((link) => `${link.entityType}:${link.entityId}` === key)
    ) {
      return;
    }
    setValue(
      "links",
      [...links, { entityType: type, entityId, entityLabel }],
      { shouldDirty: true },
    );
    setSearch("");
    setManualLabel("");
    setAdding(false);
  };

  return (
    <div className="space-y-2">
      {links.map((link) => (
        <div
          key={`${link.entityType}:${link.entityId}`}
          className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-2 text-sm"
        >
          <span className="min-w-0 truncate">
            <span className="text-muted-foreground">
              {labels[link.entityType]}:
            </span>{" "}
            {link.entityLabel}
          </span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() =>
              setValue(
                "links",
                links.filter((item) => item !== link),
                { shouldDirty: true },
              )
            }
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {adding ? (
        <div className="space-y-2 rounded-lg border border-border p-2">
          <Select
            value={type}
            onValueChange={(value) => {
              setType(value as DocLinkType);
              setSearch("");
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(labels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              type === "case" ? "ID do caso" : `Buscar ${labels[type]}`
            }
          />
          {type === "case" ? (
            <>
              <Input
                value={manualLabel}
                onChange={(event) => setManualLabel(event.target.value)}
                placeholder="Título ou identificação do caso"
              />
              <Button
                type="button"
                size="sm"
                disabled={!search.trim() || !manualLabel.trim()}
                onClick={() => add(search.trim(), manualLabel.trim())}
              >
                Adicionar
              </Button>
            </>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
                  onClick={() => add(option.id, option.label)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAdding(true)}
        >
          <Plus className="h-4 w-4" />
          Adicionar vínculo
        </Button>
      )}
    </div>
  );
}
