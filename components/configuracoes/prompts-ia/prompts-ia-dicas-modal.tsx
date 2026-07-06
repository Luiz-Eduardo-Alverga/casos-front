"use client";

import type { LucideIcon } from "lucide-react";
import {
  Ban,
  Heart,
  Info,
  Lightbulb,
  Megaphone,
  Target,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PromptDica {
  icon: LucideIcon;
  title: string;
  description: string;
}

const PROMPT_DICAS: PromptDica[] = [
  {
    icon: Megaphone,
    title: "Dica 1: Defina a persona",
    description:
      "Descreva como o assistente deve se comportar. Ex.: 'Seja técnico e objetivo, evite gírias.'",
  },
  {
    icon: Target,
    title: "Dica 2: Estabeleça objetivos claros",
    description:
      "Diga o que o assistente deve priorizar. Ex.: 'Foque em identificar a categoria correta antes de tudo.'",
  },
  {
    icon: User,
    title: "Dica 3: Conheça seu time",
    description:
      "Indique para quem ele vai extrair informações. Ex.: 'Os leitores são desenvolvedores e QAs do squad.'",
  },
  {
    icon: Heart,
    title: "Dica 4: Adicione empatia",
    description:
      "Instrua como lidar com relatos incompletos. Ex.: 'Se faltar informação, sinalize em vez de supor.'",
  },
  {
    icon: Ban,
    title: "Dica 5: Defina limites",
    description:
      "Diga o que ele NÃO deve fazer. Ex.: 'Nunca invente dados que não estejam no relato.'",
  },
  {
    icon: Info,
    title: "Dica 6: Inclua informações-chave",
    description:
      "Adicione o que ele deve sempre confirmar. Ex.: 'Sinalize campos incertos com [a confirmar].'",
  },
];

interface PromptsIaDicasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DicaCard({ icon: Icon, title, description }: PromptDica) {
  return (
    <div className="rounded-lg border border-border-divider bg-card p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
          <Icon className="h-4 w-4 text-indigo-600" />
        </div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
      </div>
      <p className="text-xs leading-relaxed text-text-secondary">
        {description}
      </p>
    </div>
  );
}

export function PromptsIaDicasModal({
  open,
  onOpenChange,
}: PromptsIaDicasModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden border-border-divider p-0 sm:max-w-[720px]">
        <div className="border-b border-border-divider px-6 py-5">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
              <Lightbulb className="h-5 w-5 text-amber-600" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg font-bold text-text-primary">
                Dicas para criar um bom prompt
              </DialogTitle>
              <DialogDescription className="text-sm text-text-secondary">
                Siga essas dicas para criar regras eficazes para o assistente.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          {PROMPT_DICAS.map((dica) => (
            <DicaCard key={dica.title} {...dica} />
          ))}
        </div>

        <div className="flex justify-end border-t border-border-divider px-6 py-4">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Entendi!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
