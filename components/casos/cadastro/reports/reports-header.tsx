import { CreateFormHeader, type CreateFormHeaderProps } from "@/components/casos/shared/create-form-header";

export interface ReportsHeaderProps
  extends Pick<
    CreateFormHeaderProps,
    "onBack" | "onLimparFormulario" | "onOpenAssistant" | "assistantDisabled"
  > {}

export function ReportsHeader(props: ReportsHeaderProps) {
  return (
    <CreateFormHeader
      title="Adicionar Novo Caso"
      description="Preencha os campos abaixo para criar um novo caso"
      {...props}
    />
  );
}
