import type { UsoAgua } from "@/lib/types";
import { formatNumber } from "@/lib/format";

export function UsoTable({ usos }: { usos: UsoAgua[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <caption className="pb-2 text-left text-[13px] text-label">
          Vazão alocada por uso, em litros por segundo
        </caption>
        <thead>
          <tr className="border-b border-input text-left text-[13px] text-label">
            <th scope="col" className="py-2.5 pr-4 font-semibold">Uso</th>
            <th scope="col" className="py-2.5 pr-4 text-right font-semibold">Normalidade (L/s)</th>
            <th scope="col" className="py-2.5 text-right font-semibold">Escassez (L/s)</th>
          </tr>
        </thead>
        <tbody>
          {usos.map((u) => (
            <tr key={u.id} className="border-b border-border last:border-0">
              <th scope="row" className="py-3 pr-4 text-left font-medium">{u.uso}</th>
              <td className="py-3 pr-4 text-right tabular-nums">{formatNumber(u.vazao_normal, 0)}</td>
              <td className="py-3 text-right tabular-nums">
                {u.vazao_escassez === 0 && u.vazao_normal > 0 ? "0 — suspenso" : formatNumber(u.vazao_escassez, 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
