"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CasoEditCardHeader } from "@/components/casos/edicao/caso-edit-card-header";
import { ClienteDetailField } from "../cliente-detail-field";
import {
  buildGoogleMapsUrl,
  displayValue,
  formatCep,
} from "@/components/clientes/utils";
import type { ClienteDetalhe } from "@/services/clientes/get-cliente-by-id";

interface ClienteEnderecoCardProps {
  cliente: ClienteDetalhe;
}

export function ClienteEnderecoCard({ cliente }: ClienteEnderecoCardProps) {
  const mapsUrl = buildGoogleMapsUrl({
    endereco: cliente.endereco,
    bairro: cliente.bairro,
    cidade: cliente.cidade,
    uf: cliente.uf,
    cep: cliente.cep,
  });

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CasoEditCardHeader title="Endereço" icon={MapPin} iconClassName="text-orange-600" />
      <CardContent className="space-y-4 p-6 pt-2">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ClienteDetailField
              label="Logradouro"
              value={displayValue(cliente.endereco)}
            />
            <ClienteDetailField
              label="Bairro"
              value={displayValue(cliente.bairro)}
            />
            <ClienteDetailField
              label="Cidade / UF"
              value={
                cliente.cidade || cliente.uf
                  ? `${displayValue(cliente.cidade)} / ${displayValue(cliente.uf)}`
                  : displayValue(null)
              }
            />
            <ClienteDetailField label="CEP" value={formatCep(cliente.cep)} />
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            asChild
          >
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir endereço no Google Maps"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
