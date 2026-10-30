"use client";

import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface UsoDiagramProps {
  src: string;
  reservatorio: string;
}

export function UsoDiagram({ src, reservatorio }: UsoDiagramProps) {
  const alt = `Imagem de satélite da região do ${reservatorio} com os pontos de uso da água marcados`;

  return (
    <section
      aria-labelledby="diag-titulo"
      className="flex flex-wrap items-center gap-x-10 gap-y-6 rounded-[20px] border border-border bg-card px-6 py-6 md:px-7"
    >
      <div className="flex flex-[1_1_300px] flex-col gap-2.5">
        <h2 id="diag-titulo" className="m-0 text-lg font-bold">
          Diagrama de usos
        </h2>
        <p className="m-0 max-w-[48ch] text-[15px] leading-relaxed text-muted-foreground texto-corrido">
          Mapa com a localização dos pontos de captação e dos usos atendidos pelo reservatório.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 self-start rounded-[10px] border border-input bg-card px-4 text-sm font-semibold hover:bg-muted"
            >
              <Maximize2 aria-hidden="true" className="size-4" />
              Ampliar imagem
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="m-0 pr-12 text-lg font-bold">Diagrama de usos — {reservatorio}</DialogTitle>
            <DialogDescription className="sr-only">{alt}</DialogDescription>
            <div className="relative h-[75vh] w-full">
              <Image src={src} alt={alt} fill sizes="100vw" className="object-contain" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <figure className="m-0 flex flex-[999_1_420px] flex-col gap-2">
        <div className="relative h-[320px] w-full overflow-hidden rounded-[14px] bg-muted md:h-[440px]">
          <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 800px" className="object-contain" />
        </div>
      </figure>
    </section>
  );
}
