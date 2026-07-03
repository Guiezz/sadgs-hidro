// src/app/visao-geral/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import { config } from "@/config";
import { IdentificationData } from "@/lib/types";
import { Loader2, MapPin, Droplets, Waves, Home, Crosshair } from "lucide-react";
import IdentificationMapWrapper from "@/components/dashboard/IdentificationMapWrapper";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";
import Image from "next/image";

export default function VisaoGeralPage() {
  const { selectedReservoir } = useReservoir();

  const [data, setData] = useState<IdentificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedReservoir) {
      setIsLoading(false);
      return;
    }

    const getIdentificationData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${config.apiBaseUrl}/reservatorios/${selectedReservoir.id}/identification`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("Falha ao buscar dados de identificação");
        const fetchedData: IdentificationData = await res.json();
        setData(fetchedData);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Ocorreu um erro desconhecido.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    getIdentificationData();
  }, [selectedReservoir]);

  if (!selectedReservoir) {
    return <EmptyReservoirState />;
  }

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center p-4 lg:p-8 bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">
            Carregando dados do reservatório...
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex flex-1 items-center justify-center p-4 lg:p-8 bg-background">
        <div className="text-center p-6 bg-card border rounded-xl shadow-sm">
          <h1 className="text-2xl font-semibold text-destructive mb-2">
            Erro ao carregar os dados
          </h1>
          <p>
            {error || "Verifique se a API está em execução e tente novamente."}
          </p>
        </div>
      </main>
    );
  }

  const paragraphs = data.descricao.split("\n").filter((p) => p.trim() !== "");

  return (
    <main className="flex flex-1 flex-col bg-background">
      {/* Hero */}
      <section className="relative -mx-4 lg:-mx-8 -mt-4 sm:-mt-6 h-[50vh] md:h-[60vh] overflow-hidden">
        {data.url_imagem ? (
          <Image
            src={data.url_imagem}
            alt={`Vista do reservatório ${data.nome}`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-14 max-w-7xl mx-auto">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-muted-foreground mb-4 border border-border/40">
              <MapPin className="h-3 w-3 text-primary" />
              {data.municipio}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-none">
              {data.nome}
            </h1>
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedReservoir.bacia && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                  {selectedReservoir.bacia}
                </span>
              )}
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-muted/80 text-muted-foreground border border-border/40">
                {selectedReservoir.capacidade_hm3.toFixed(2)} hm³
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section className="max-w-4xl mx-auto w-full px-6 md:px-10 lg:px-14 py-14 md:py-18">
        <div className="border-l-2 border-primary pl-6 md:pl-8 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">
              Sobre
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              O Reservatório
            </h2>
          </div>
          <div className="space-y-4 text-base md:text-lg leading-relaxed text-muted-foreground max-w-3xl">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <p className="italic text-muted-foreground/60">
                Informações não disponíveis para este reservatório.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Vista + Dados */}
      <section className="bg-muted/20 py-14 md:py-18">
        <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Vista */}
            <div>
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                {data.url_imagem ? (
                  <Image
                    src={data.url_imagem}
                    alt={`Vista do reservatório ${data.nome}`}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
                    Imagem não disponível
                  </div>
                )}
              </div>
            </div>

            {/* Dados */}
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">
                  Dados Técnicos
                </span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  Informações do Reservatório
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatItem
                  icon={<Droplets className="h-5 w-5 text-primary" />}
                  label="Capacidade"
                  value={`${selectedReservoir.capacidade_hm3.toFixed(2)} hm³`}
                />
                <StatItem
                  icon={<Waves className="h-5 w-5 text-primary" />}
                  label="Bacia Hidrográfica"
                  value={selectedReservoir.bacia || "Não informada"}
                />
                <StatItem
                  icon={<Home className="h-5 w-5 text-primary" />}
                  label="Município"
                  value={data.municipio}
                />
                <StatItem
                  icon={<Crosshair className="h-5 w-5 text-primary" />}
                  label="Coordenadas"
                  value={`${data.lat.toFixed(4)}, ${data.long.toFixed(4)}`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Localização */}
      <section className="py-14 md:py-18">
        <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-14 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Localização
              </h2>
              <p className="text-sm text-muted-foreground">
                Mapa de referência do reservatório
              </p>
            </div>
          </div>
          <div className="h-[400px] lg:h-[500px] rounded-xl overflow-hidden border border-border/40 shadow-sm">
            <IdentificationMapWrapper lat={data.lat} lon={data.long} />
          </div>
        </div>
      </section>
    </main>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 bg-background rounded-xl p-4 border border-border/40 shadow-sm">
      <div className="bg-primary/10 p-2 rounded-lg shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}
