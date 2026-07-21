"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTicket } from "@/services/tickets/create-ticket";
import type { CreateTicketRequest } from "@/interfaces/cliente-ticket";

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketRequest) => createTicket(data),
    onSuccess: (ticket) => {
      void queryClient.invalidateQueries({ queryKey: ["tickets-cliente"] });
      void queryClient.invalidateQueries({
        queryKey: ["ticket", ticket.id],
      });
    },
  });
}
