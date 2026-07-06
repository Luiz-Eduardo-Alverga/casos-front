"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ClienteView } from "@/components/clientes/visualizacao";

interface ClienteViewPageProps {
  params: Promise<{ id: string }>;
}

export default function ClienteViewPage({ params }: ClienteViewPageProps) {
  const router = useRouter();
  const { id } = use(params);

  if (!id?.trim()) {
    router.replace("/clientes");
    return null;
  }

  return (
    <div className="flex flex-1 flex-col px-6 pt-20 lg:min-h-0 lg:overflow-hidden">
      <ClienteView clienteId={id} />
    </div>
  );
}
