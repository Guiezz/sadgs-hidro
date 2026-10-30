import type { UsoAgua } from "@/lib/types";
import { formatNumber } from "@/lib/format";

// Barras pareadas em HTML: cada uso com normalidade (água) e escassez (laranja claro).
export function UsoBars({ usos }: { usos: UsoAgua[] }) {
  const max = Math.max(1, ...usos.map((u) => Math.max(u.vazao_normal, u.vazao_escassez)));
  const width = (v: number) => (v > 0 ? `${(v / max) * 100}%` : "2px");

  return (
    <ul aria-label="Vazão por uso, normalidade e escassez" className="m-0 flex list-none flex-col p-0">
      {usos.map((u) => {
        const suspenso = u.vazao_escassez === 0 && u.vazao_normal > 0;
        return (
          <li
            key={u.id}
            className="grid grid-cols-1 items-center gap-x-5 gap-y-2 rounded-lg border-b border-muted px-2 py-2.5 last:border-0 hover:bg-background md:grid-cols-[minmax(180px,300px)_minmax(0,1fr)]"
          >
            <span className="text-sm leading-snug font-medium">{u.uso}</span>
            <span className="flex flex-col gap-1">
              <span className="flex items-center gap-2">
                <span
                  className="block h-3.5 max-w-[calc(100%-56px)] rounded-r bg-water"
                  style={{ width: width(u.vazao_normal) }}
                />
                <span className="text-xs font-semibold tabular-nums">
                  <span className="sr-only">Normalidade: </span>
                  {formatNumber(u.vazao_normal, 0)}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="block h-3.5 max-w-[calc(100%-56px)] rounded-r bg-scarcity"
                  style={{ width: width(u.vazao_escassez) }}
                />
                <span className="text-xs font-semibold tabular-nums">
                  <span className="sr-only">Escassez: </span>
                  {suspenso ? "0 — suspenso" : formatNumber(u.vazao_escassez, 0)}
                </span>
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
