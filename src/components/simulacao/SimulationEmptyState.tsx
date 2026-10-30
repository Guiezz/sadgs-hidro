import { ChartSpline } from "lucide-react";

const PASSOS = ["Volume inicial", "Período", "Demanda"];

export function SimulationEmptyState() {
  return (
    <div className="flex flex-col items-center gap-5 rounded-[20px] border border-dashed border-input bg-card px-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="flex size-16 items-center justify-center rounded-2xl bg-water-soft text-water"
      >
        <ChartSpline className="size-8" />
      </span>
      <div className="flex flex-col gap-2">
        <h2 id="res-titulo" className="m-0 text-xl font-bold">
          Pronto para simular
        </h2>
        <p className="m-0 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
          Os resultados aparecem aqui: a evolução do volume, as falhas de atendimento e os indicadores do cenário.
        </p>
      </div>
      <ol className="m-0 flex list-none flex-wrap justify-center gap-3 p-0">
        {PASSOS.map((p, i) => (
          <li key={p} className="flex items-center gap-2 rounded-full bg-background px-3.5 py-1.5 text-sm font-medium">
            <span
              aria-hidden="true"
              className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white"
            >
              {i + 1}
            </span>
            {p}
          </li>
        ))}
      </ol>
    </div>
  );
}
