"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { CasoEditView } from "@/components/caso-edit/index";

interface CasoEditPageProps {
  params: Promise<{ id: string }>;
}

export default function CasoEditPage({ params }: CasoEditPageProps) {
  const router = useRouter();
  const { id } = use(params);

  if (!id || id === "novo") {
    router.replace("/casos");
    return null;
  }

  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden">
      <CasoEditView casoId={id} />
    </div>
  );
}
