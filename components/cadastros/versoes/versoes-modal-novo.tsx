"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createVersionAction } from "@/app/(dashboard)/cadastros/_actions/cadastros-db";
import { versionCreateSchema } from "@/lib/validators/db/versions";
import type { VersionCreateInput } from "@/lib/validators/db/versions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface VersoesModalNovoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersoesModalNovo({ open, onOpenChange }: VersoesModalNovoProps) {
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const handleClose = (next: boolean) => {
    if (!next) form.reset({ name: "" });
    onOpenChange(next);
  };

  const onSubmit = form.handleSubmit((values) => {
    const trimmed = values.name?.trim() ?? "";
    const body: VersionCreateInput = trimmed ? { name: trimmed } : { name: null };

    const parsed = versionCreateSchema.safeParse(body);
    if (!parsed.success) {
      toast.error(parsed.error.flatten().formErrors[0] ?? "Dados inválidos");
      return;
    }

    startTransition(async () => {
      const res = await createVersionAction(parsed.data);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Versão cadastrada.");
      handleClose(false);
      await queryClient.invalidateQueries({ queryKey: ["db-versions"] });
    });
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova versão</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ver-name">Nome (opcional)</Label>
            <Input
              id="ver-name"
              autoComplete="off"
              placeholder="Ex.: 2.4.0"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
