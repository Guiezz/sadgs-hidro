"use client";

import Script from "next/script";
import { umamiBeforeSend } from "@/lib/analytics";

const WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
// Lista separada por vírgula; fora dela (ex.: localhost) nada é enviado.
const DOMAINS = process.env.NEXT_PUBLIC_UMAMI_DOMAINS;

// Precisa existir antes do primeiro pageview, então é registrado ao carregar o módulo.
if (typeof window !== "undefined") window.umamiBeforeSend = umamiBeforeSend;

// Sem o ID configurado (dev, testes) o script nem é carregado.
export function Analytics() {
  if (!WEBSITE_ID) return null;
  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={WEBSITE_ID}
      data-before-send="umamiBeforeSend"
      {...(DOMAINS ? { "data-domains": DOMAINS } : {})}
      strategy="afterInteractive"
    />
  );
}
