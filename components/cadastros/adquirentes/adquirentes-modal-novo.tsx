"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAcquirerAction } from "@/app/(dashboard)/cadastros/_actions/cadastros-db";
import { acquirerCreateSchema } from "@/lib/validators/db/acquirers";
import type { AcquirerCreateInput } from "@/lib/validators/db/acquirers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  name: z.string().min(1, "Nome é obrigatório"),
  logoUrl: z.string().optional(),
  has4g: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface AdquirentesModalNovoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdquirentesModalNovo({
  open,
  onOpenChange,
}: AdquirentesModalNovoProps) {
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", logoUrl: "", has4g: false },
  });

  const [logoError, setLogoError] = useState<string | undefined>();

  const handleClose = (next: boolean) => {
    if (!next) {
      form.reset({ name: "", logoUrl: "", has4g: false });
      setLogoError(undefined);
    }
    onOpenChange(next);
  };

  const onSubmit = form.handleSubmit((values) => {
    const trimmedLogo = values.logoUrl?.trim() ?? "";
    const body: AcquirerCreateInput = {
      name: values.name.trim(),
      has4g: values.has4g,
    };
    if (trimmedLogo) body.logoUrl = trimmedLogo;

    const parsed = acquirerCreateSchema.safeParse(body);
    if (!parsed.success) {
      const logoIssue = parsed.error.flatten().fieldErrors.logoUrl?.[0];
      setLogoError(logoIssue);
      return;
    }
    setLogoError(undefined);

    startTransition(async () => {
      const res = await createAcquirerAction(parsed.data);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Adquirente cadastrado.");
      handleClose(false);
      await queryClient.invalidateQueries({ queryKey: ["db-acquirers"] });
    });
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo adquirente</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="acq-name">Nome</Label>
            <Input
              id="acq-name"
              autoComplete="off"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="acq-logo">URL do logo (opcional)</Label>
            <Input
              id="acq-logo"
              type="url"
              placeholder="https://..."
              autoComplete="off"
              {...form.register("logoUrl")}
            />
            {logoError && (
              <p className="text-sm text-destructive">{logoError}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="acq-4g"
              checked={form.watch("has4g")}
              onCheckedChange={(c) =>
                form.setValue("has4g", c === true, { shouldValidate: true })
              }
            />
            <Label htmlFor="acq-4g" className="font-normal cursor-pointer">
              Possui 4G
            </Label>
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
