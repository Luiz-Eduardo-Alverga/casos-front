"use client";

import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormProvider } from "react-hook-form";
import { useCasoForm } from "./provider";

interface CasoFormProps {
  children: ReactNode;
  title?: string;
  description?: string;
  onSubmit: (data: any) => Promise<void> | void;
}

export function CasoForm({ 
  children, 
  title = "Formulário para abrir caso",
  description = "Preencha os detalhes abaixo ou use o assistente IA acima",
  onSubmit 
}: CasoFormProps) {
  const { form, isDisabled } = useCasoForm();
  
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  {title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  {description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            {children}
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
