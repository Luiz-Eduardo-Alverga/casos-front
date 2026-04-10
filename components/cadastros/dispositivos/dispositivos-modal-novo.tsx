"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createDeviceAction } from "@/app/(dashboard)/cadastros/_actions/cadastros-db";
import { deviceCreateSchema } from "@/lib/validators/db/devices";
import type { DeviceCreateInput } from "@/lib/validators/db/devices";
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

type FormValues = DeviceCreateInput;

interface DispositivosModalNovoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DispositivosModalNovo({
  open,
  onOpenChange,
}: DispositivosModalNovoProps) {
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(deviceCreateSchema),
    defaultValues: { name: "" },
  });

  const handleClose = (next: boolean) => {
    if (!next) form.reset({ name: "" });
    onOpenChange(next);
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const res = await createDeviceAction({ name: values.name.trim() });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Dispositivo cadastrado.");
      handleClose(false);
      await queryClient.invalidateQueries({ queryKey: ["db-devices"] });
    });
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo dispositivo</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dev-name">Nome</Label>
            <Input
              id="dev-name"
              autoComplete="off"
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
