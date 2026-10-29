// src/components/dashboard/ActionStatusTabs.tsx
"use client";

import { useState } from "react";
import { CircleCheck, Hourglass } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { splitActions, splitList } from "@/lib/text";
import type { PlanoAcao } from "@/lib/types";

interface Props {
  ongoing: PlanoAcao[];
  completed: PlanoAcao[];
}

const PER_PAGE = 6;

function ActionList({ data }: { data: PlanoAcao[] }) {
  const [page, setPage] = useState(1);
  const pages = Math.ceil(data.length / PER_PAGE);
  const current = data.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex flex-col gap-3">
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {current.map((a) => (
          <li key={a.id} className="flex flex-col gap-1 rounded-xl border border-border px-4 py-3">
            <span className="text-sm font-semibold">{splitActions(a.acoes)[0] ?? a.acoes}</span>
            {a.responsaveis && (
              <span className="text-[13px] text-muted-foreground">
                Responsáveis: {splitList(a.responsaveis).slice(0, 3).join(", ")}
              </span>
            )}
          </li>
        ))}
      </ul>
      {pages > 1 && (
        <nav aria-label="Paginação das ações" className="flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-10 rounded-lg px-3 font-semibold hover:bg-muted disabled:opacity-40"
          >
            Anterior
          </button>
          <span aria-live="polite">
            Página {page} de {pages}
          </span>
          <button
            type="button"
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
            className="h-10 rounded-lg px-3 font-semibold hover:bg-muted disabled:opacity-40"
          >
            Próxima
          </button>
        </nav>
      )}
    </div>
  );
}

function Empty({ icon: Icon, title, text }: { icon: typeof Hourglass; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-3 py-7 text-center">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full border border-dashed border-input bg-background text-link"
      >
        <Icon className="size-6" />
      </span>
      <p className="m-0 text-[15px] font-semibold">{title}</p>
      <p className="m-0 max-w-[260px] text-sm leading-normal text-muted-foreground">{text}</p>
    </div>
  );
}

export function ActionStatusTabs({ ongoing, completed }: Props) {
  return (
    <aside
      aria-labelledby="situacao-titulo"
      className="flex flex-[1_1_320px] flex-col gap-4 rounded-2xl border border-border bg-card p-[22px]"
    >
      <h2 id="situacao-titulo" className="m-0 text-lg font-bold">
        Situação das ações
      </h2>
      <Tabs defaultValue="ongoing">
        <TabsList aria-label="Filtrar por situação" className="grid h-auto w-full grid-cols-2 gap-1 rounded-[10px] bg-muted p-1">
          <TabsTrigger value="ongoing" className="h-[38px] rounded-[7px] font-semibold data-[state=active]:shadow-sm">
            Em andamento ({ongoing.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="h-[38px] rounded-[7px] font-semibold data-[state=active]:shadow-sm">
            Concluídas ({completed.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ongoing" className="mt-4">
          {ongoing.length > 0 ? (
            <ActionList data={ongoing} />
          ) : (
            <Empty
              icon={Hourglass}
              title="Nenhuma ação em andamento"
              text="Quando uma ação das medidas ao lado for iniciada, ela aparece aqui com os responsáveis."
            />
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          {completed.length > 0 ? (
            <ActionList data={completed} />
          ) : (
            <Empty icon={CircleCheck} title="Nenhuma ação concluída" text="As ações finalizadas aparecem aqui." />
          )}
        </TabsContent>
      </Tabs>
    </aside>
  );
}
