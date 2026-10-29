import type { IdentificationData } from "@/lib/types";
import { formatDms, formatNumber } from "@/lib/format";
import { splitList } from "@/lib/text";

interface FichaTecnicaProps {
  data: IdentificationData;
}

// Linhas sem dado na API não aparecem.
export function FichaTecnica({ data }: FichaTecnicaProps) {
  const construcao = [data.ano_construcao, data.construtor].filter(Boolean).join(" · ");
  const rows: [string, string | null][] = [
    ["Capacidade", data.capacidade_hm3 ? `${formatNumber(data.capacidade_hm3)} hm³` : null],
    ["Área de drenagem", data.area_drenagem_km2 ? `${formatNumber(data.area_drenagem_km2)} km²` : null],
    ["Construção", construcao || null],
    ["Rio barrado", data.rio_barrado ?? null],
    ["Bacia", data.bacia ?? null],
    ["Código FUNCEME", data.codigo_funceme || null],
    [
      "Coordenadas",
      Number.isFinite(data.lat) && Number.isFinite(data.long) && (data.lat !== 0 || data.long !== 0)
        ? `${formatDms(data.lat, "lat")} · ${formatDms(data.long, "long")}`
        : null,
    ],
  ];
  const municipios = splitList(data.municipios_atendidos);

  return (
    <section
      aria-labelledby="ficha-titulo"
      className="flex flex-col gap-4 rounded-[20px] border border-border bg-card p-6 md:p-7"
    >
      <h2 id="ficha-titulo" className="m-0 text-lg font-bold">
        Ficha técnica
      </h2>
      <dl className="m-0 flex flex-col">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div
              key={label}
              className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-border py-3 last:border-0"
            >
              <dt className="text-sm text-label">{label}</dt>
              <dd className="m-0 text-right text-sm font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
      </dl>
      {municipios.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h3 id="municipios-titulo" className="m-0 text-sm font-bold">
            Municípios atendidos
          </h3>
          <ul aria-labelledby="municipios-titulo" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {municipios.map((m) => (
              <li key={m} className="rounded-full bg-muted px-3 py-1 text-[13px] font-medium">
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
