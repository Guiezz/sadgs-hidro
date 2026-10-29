"use client";

import Image from "next/image";

export function Parceiros() {
  return (
    <div className="w-full space-y-20 py-10">
      {/* Linha 01: Parceiros Acadêmicos e Técnicos (Cientista chefe, Cepas, UFC) */}
      <div className="flex flex-wrap justify-center items-center gap-16 md:gap-28">
        <div className="flex items-center justify-center">
          <Image
            src="/logos/cientista-chefe.png"
            alt="Cientista Chefe"
            width={240}
            height={80}
            className="h-16 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>
        <div className="flex items-center justify-center border-x px-12 border-border/40">
          <Image
            src="/logos/cepas.png"
            alt="CEPAS"
            width={160}
            height={80}
            className="h-20 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>
        <div className="flex items-center justify-center">
          <Image
            src="/logos/ufc-h.png"
            alt="UFC"
            width={200}
            height={80}
            className="h-20 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>

      {/* Linha 02: Órgãos Gestores e Governo (Cogerh, funceme, funcap, Governo) */}
      <div className="flex flex-col xl:flex-row justify-center items-center gap-16 md:gap-24">
        {/* Grupo das Vinculadas */}
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
          <Image
            src="/logos/cogerh.png"
            alt="COGERH"
            width={180}
            height={70}
            className="h-20 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
          />
          <Image
            src="/logos/funceme.png"
            alt="FUNCEME"
            width={180}
            height={70}
            className="h-20 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
          />
          <Image
            src="/logos/funcap.png"
            alt="FUNCAP"
            width={180}
            height={70}
            className="h-20 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>

        {/* Logo do Governo - Em destaque e maior */}
        <div className="pt-8 xl:pt-0 xl:border-l xl:pl-20 border-border/40">
          <Image
            src="/logos/srh-h.png"
            alt="Governo do Estado do Ceará"
            width={520}
            height={180}
            className="h-25 w-auto max-h-44 md:max-h-52 brightness-110"
          />
        </div>
      </div>
    </div>
  );
}
