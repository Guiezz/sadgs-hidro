// src/app/planos-de-acao/page.tsx

import ActionPlanClient from "@/components/plans/ActionPlanClient";

export default function ActionPlansPage() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-6 bg-background">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Catálogo
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Planos de Ação
        </h1>
      </div>
      <ActionPlanClient />
    </main>
  );
}
