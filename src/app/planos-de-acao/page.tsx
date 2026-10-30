// src/app/planos-de-acao/page.tsx
"use client";

import { useReservoir } from "@/context/ReservoirContext";
import ActionPlanClient from "@/components/plans/ActionPlanClient";
import { PageHeader } from "@/components/app/PageHeader";

export default function ActionPlansPage() {
  const { selectedReservoir } = useReservoir();
  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pt-9 pb-20 md:px-10">
      <PageHeader
        eyebrow="Catálogo"
        title="Planos de Ação"
        description={
          selectedReservoir
            ? `Ações estratégicas e emergenciais do Plano de Seca do ${selectedReservoir.nome}, com as classes de medida e os responsáveis por cada uma.`
            : "Ações estratégicas e emergenciais dos Planos de Seca, com as classes de medida e os responsáveis por cada uma."
        }
      />
      <ActionPlanClient />
    </div>
  );
}
