"use client";

import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/badges/status-badge";
import { CLIENTE_SITUACAO_BADGE_CONFIG } from "@/components/clientes/cliente-situacao-badge-config";
import { CasoEditCardHeader } from "@/components/casos/edicao/caso-edit-card-header";
import { ClienteDetailField } from "../cliente-detail-field";
import {
  displayValue,
  formatCnpj,
  formatDataCadastro,
} from "@/components/clientes/utils";
import type { ClienteDetalhe } from "@/services/clientes/get-cliente-by-id";

interface ClienteDadosGeraisCardProps {
  cliente: ClienteDetalhe;
}

export function ClienteDadosGeraisCard({ cliente }: ClienteDadosGeraisCardProps) {
  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CasoEditCardHeader title="Dados gerais" icon={FileText} iconClassName="text-sky-600" />
      <CardContent className="space-y-4 p-6 pt-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ClienteDetailField
            label="Código (registro)"
            value={`#${cliente.registro}`}
          />
          <ClienteDetailField
            label="Nome (fantasia)"
            value={displayValue(cliente.nome)}
          />
          <ClienteDetailField
            label="Razão social"
            value={displayValue(cliente.razao_social)}
          />
          <ClienteDetailField
            label="CNPJ"
            value={formatCnpj(cliente.cnpj)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ClienteDetailField
            label="Situação"
            value={
              <StatusBadge
                status={cliente.desativado ? "Inativo" : "Ativo"}
                config={CLIENTE_SITUACAO_BADGE_CONFIG}
              />
            }
          />
          <ClienteDetailField
            label="Data de cadastro"
            value={formatDataCadastro(cliente.data_cadastro)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
