"use client";

import { UsoAgua } from "@/lib/types";
import { UsoAguaChartV2 } from "./UsoAguaChartV2";
import { UsoAguaChartMobile } from "./UsoAguaChartMobile";

interface Props {
  data: UsoAgua[];
}

export function UsoAguaChartResponsive({ data }: Props) {
  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        Comparativo de vazão por setor em cenários de Normalidade vs. Escassez Hídrica.
      </p>
      <div className="hidden lg:block">
        <UsoAguaChartV2 data={data} />
      </div>
      <div className="block lg:hidden">
        <UsoAguaChartMobile data={data} />
      </div>
    </>
  );
}
