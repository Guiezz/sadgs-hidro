import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatNumber, formatSigned } from "@/lib/format";
import { distanceToNextLimit } from "@/lib/monitoring";
import { droughtLabel, normalizeDroughtState } from "@/lib/drought-state";

interface MonitoringKpisProps {
  volumeHm3: number;
  volumePct: number;
  capacidadeHm3: number | null;
  variation: { deltaHm3: number; perDay: number; days: number } | null;
  diasNoEstado: number | null;
  limites: number[] | null;
  medidasAtivas: number;
  estado: string;
}

const cell = "flex flex-col gap-1.5 bg-card px-7 py-6";
const dt = "text-[13px] font-semibold text-label";
const big = "font-display text-[40px] font-bold leading-none tabular-nums";
const unit = "text-base text-muted-foreground";
const note = "m-0 text-[13px] text-muted-foreground";

export function MonitoringKpis({
  volumeHm3,
  volumePct,
  capacidadeHm3,
  variation,
  diasNoEstado,
  limites,
  medidasAtivas,
  estado,
}: MonitoringKpisProps) {
  const key = normalizeDroughtState(estado);
  const distancia = limites ? distanceToNextLimit(volumePct, limites) : null;
  const falling = variation !== null && variation.deltaHm3 < 0;

  return (
    <dl className="m-0 grid flex-[999_1_420px] grid-cols-1 gap-px bg-border sm:grid-cols-2">
      <div className={cell}>
        <dt className={dt}>Volume atual</dt>
        <dd className="m-0 flex items-baseline gap-1.5">
          <span className={big}>{formatNumber(volumeHm3)}</span>
          <span className={unit}>hm³</span>
        </dd>
        <dd className="m-0 flex flex-col gap-2">
          <span className="text-[13px] text-muted-foreground">
            {formatNumber(volumePct, 1)}% da capacidade
            {capacidadeHm3 ? ` de ${formatNumber(capacidadeHm3)} hm³` : ""}
          </span>
          <span
            role="meter"
            aria-label="Volume em relação à capacidade"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volumePct * 10) / 10}
            className="block h-2 overflow-hidden rounded-full bg-water-soft"
          >
            <span
              className="block h-full rounded-full bg-water"
              style={{ width: `${Math.min(Math.max(volumePct, 0), 100)}%` }}
            />
          </span>
        </dd>
      </div>

      <div className={cell}>
        <dt className={dt}>Variação em {variation?.days ?? 7} {variation?.days === 1 ? "dia" : "dias"}</dt>
        <dd className="m-0 flex items-baseline gap-1.5">
          <span className={`${big} ${falling ? "text-decline" : ""}`}>
            {variation ? formatSigned(variation.deltaHm3) : "—"}
          </span>
          {variation && <span className={unit}>hm³</span>}
        </dd>
        <dd className={`${note} flex items-center gap-1.5`}>
          {variation ? (
            <>
              {falling ? (
                <TrendingDown aria-hidden="true" className="size-4 text-decline" />
              ) : (
                <TrendingUp aria-hidden="true" className="size-4 text-water" />
              )}
              {variation.perDay === 0
                ? "Volume estável no período"
                : `${falling ? "Queda" : "Alta"} média de ${formatNumber(Math.abs(variation.perDay))} hm³ por dia`}
            </>
          ) : (
            "Registros insuficientes para calcular"
          )}
        </dd>
      </div>

      <div className={cell}>
        <dt className={dt}>Tempo no estado atual</dt>
        <dd className="m-0 flex items-baseline gap-1.5">
          <span className={big}>{diasNoEstado ?? "—"}</span>
          {diasNoEstado !== null && <span className={unit}>{diasNoEstado === 1 ? "dia" : "dias"}</span>}
        </dd>
        {distancia !== null && (
          <dd className={note}>
            {distancia.direcao === "acima"
              ? `${formatNumber(distancia.pp, 1)} p.p. acima do limite do estado Normal`
              : `${formatNumber(distancia.pp, 1)} p.p. para chegar ao estado ${droughtLabel(distancia.estado)}`}
          </dd>
        )}
      </div>

      <div className={cell}>
        <dt className={dt}>Medidas ativas</dt>
        <dd className={`m-0 ${big}`}>{medidasAtivas}</dd>
        <dd className="m-0">
          <Link href="/implementacao-planos-de-seca" className="text-sm font-semibold">
            Ver medidas{key ? ` do estado ${droughtLabel(key)}` : ""} →
          </Link>
        </dd>
      </div>
    </dl>
  );
}
