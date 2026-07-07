"use client";

import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  StatusBadge,
  type StatusBadgeConfigItem,
} from "@/components/badges/status-badge";
import { CasoEditCardHeader } from "@/components/casos/edicao/caso-edit-card-header";
import { ClienteDetailField } from "../cliente-detail-field";
import {
  displayValue,
  formatCnpj,
  formatDataCadastro,
} from "@/components/clientes/utils";
import type { ClienteDetalhe } from "@/services/clientes/get-cliente-by-id";

const CLIENTE_SITUACAO_BADGE_CONFIG: StatusBadgeConfigItem[] = [
  {
    values: ["ATIVO"],
    style: {
      container: "bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800",
      dot: "bg-green-500 dark:bg-green-400",
      text: "text-green-700 dark:text-green-400",
    },
  },
  {
    values: ["INATIVO"],
    style: {
      container: "bg-gray-50 border-gray-200 dark:bg-gray-800/40 dark:border-gray-700",
      dot: "bg-gray-500 dark:bg-gray-400",
      text: "text-gray-700 dark:text-gray-300",
    },
  },
  {
    values: [],
    style: {
      container: "bg-gray-50 border-gray-200 dark:bg-gray-800/40 dark:border-gray-700",
      dot: "bg-gray-500 dark:bg-gray-400",
      text: "text-gray-700 dark:text-gray-300",
    },
  },
];

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
