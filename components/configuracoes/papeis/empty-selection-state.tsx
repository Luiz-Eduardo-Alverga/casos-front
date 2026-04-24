import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/painel/empty-state";

/** Card ocupando a área direita quando nenhum papel está selecionado. */
export function EmptySelectionState() {
  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
      <CardContent className="p-6 lg:flex-1 lg:min-h-0 flex items-center justify-center">
        <EmptyState
          icon={ShieldCheck}
          title="Selecione um papel"
          description="Escolha um papel na lista ao lado ou clique em Novo Perfil para começar."
        />
      </CardContent>
    </Card>
  );
}
