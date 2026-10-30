"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const medir = () => setVisivel(window.scrollY > window.innerHeight);
    medir(); // página recarregada no meio da rolagem
    window.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir, { passive: true });
    return () => {
      window.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, []);

  if (!visivel) return null;

  const subir = () => {
    const reduzir = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduzir ? "auto" : "smooth" });
    document.getElementById("conteudo")?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={subir}
      aria-label="Voltar ao topo"
      className="fixed bottom-5 right-4 z-40 flex size-11 items-center justify-center rounded-full bg-secondary text-white shadow-lg md:hidden"
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </button>
  );
}
