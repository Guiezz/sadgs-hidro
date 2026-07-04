"use client";

import { useState, useEffect } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import { config } from "@/config";
import { Responsavel } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Parceiros } from "@/components/responsaveis/Parceiros";
import { Users2, Building2, Loader2 } from "lucide-react";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";

// Tipo para a estrutura de dados agrupada
type GroupedData = {
  [grupo: string]: {
    [organizacao: string]: Responsavel[];
  };
};

const MemberList = ({ members }: { members: Responsavel[] | undefined }) => {
  if (!members || members.length === 0) {
    return <p className="text-sm text-muted-foreground">-</p>;
  }
  return (
    <div className="space-y-3">
      {members.map((membro, idx) => (
        <div
          key={`${membro.nome}-${idx}`}
          className="flex flex-col border-l-2 border-primary/20 pl-3 py-1 transition-colors hover:border-primary"
        >
          <span className="text-sm font-medium text-foreground">
            {membro.nome}
          </span>
          {membro.cargo && (
            <span className="text-xs text-muted-foreground italic">
              {membro.cargo}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default function ResponsaveisPage() {
  const { selectedReservoir } = useReservoir();
  const [groupedData, setGroupedData] = useState<GroupedData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ordem de exibição dos grupos conforme solicitado
  const grupoDisplayOrder: string[] = [
    "Créditos Institucionais",
    "Comitê da Bacia Hidrográfica da Região Metropolitana de Fortaleza",
    "Comitê da Sub-Bacia Hidrográfica do Alto Jaguaribe",
    "Comitê da Bacia Hidrográfica do Salgado",
    "COMITÊ DA BACIA HIDROGRÁFICA DOS SERTÕES DE CRATEÚS",
    "Comitê da Sub-Bacia Hidrográfica Acaraú",
    "COMITÊ DA BACIA HIDROGRÁFICA DA SERRA DA IBIAPABA",
    "COMISSÃO GESTORA DO AÇUDE ACARAPE DO MEIO",
    "COMITÊ DA BACIA HIDROGRÁFICA DO LITORAL",
    "COMISSÃO GESTORA DO AÇUDE MISSI",
    "Comitê da Sub-Bacia Hidrográfica do Rio Banabuiú",
    "SECRETARIA-EXECUTIVA",
    "OUTROS ATORES PARTICIPANTES DA ELABORAÇÃO DO PLANO",
    "Equipe de Desenvolvimento do Sistema de Apoio à Decisão",
    "Equipe de Execução",
  ];

  const organizacaoOrder: { [key: string]: string[] } = {
    "Créditos Institucionais": [
      "GOVERNADOR DO ESTADO DO CEARÁ",
      "SECRETARIA DOS RECURSOS HÍDRICOS – SRH",
      "COMPANHIA DE GESTÃO DOS RECURSOS HÍDRICOS – COGERH",
      "Fundação Cearense de Meteorologia e Recursos Hídricos",
    ],
    "Equipe de Execução": [
      "COORDENAÇÃO GERAL",
      "COORDENAÇÃO DAS EQUIPES DE ELABORAÇÃO",
      "COGERH",
      "FUNCEME",
      "EQUIPE DE ELABORAÇÃO",
      "COMUNICAÇÃO VISUAL – CEPAS/UFC/FUNCAP",
    ],
    "EQUIPE DE EXECUÇÃO": [
      "COORDENAÇÃO GERAL",
      "COORDENAÇÃO DAS EQUIPES DE ELABORAÇÃO",
      "COGERH",
      "FUNCEME",
      "EQUIPE DE ELABORAÇÃO",
      "COMUNICAÇÃO VISUAL – CEPAS/UFC/FUNCAP",
    ],
    "Equipe de Projeto": [
      "COORDENAÇÃO GERAL",
      "FUNCAP/UFC",
      "COGERH",
      "FUNCEME",
      "EQUIPE DE ELABORAÇÃO",
      "COMUNICAÇÃO VISUAL – CEPAS/UFC/FUNCAP",
    ],
    "EQUIPE DO PROJETO": [
      "COORDENAÇÃO GERAL",
      "FUNCAP/UFC",
      "COGERH",
      "FUNCEME",
      "EQUIPE DE ELABORAÇÃO",
      "COMUNICAÇÃO VISUAL – CEPAS/UFC/FUNCAP",
    ],
  };

  useEffect(() => {
    if (!selectedReservoir) {
      setIsLoading(false);
      return;
    }

    const getResponsaveisData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${config.apiBaseUrl}/reservatorios/${selectedReservoir.id}/responsibles`,
        );
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data: Responsavel[] = await res.json();

        const grouped = data.reduce<GroupedData>((acc, responsavel) => {
          const grupo = responsavel.grupo || "Outros Grupos";
          let orgChave: string;

          const isComissaoGestora =
            grupo.toUpperCase().includes("COMISSÃO GESTORA") ||
            (responsavel.organizacao &&
              responsavel.organizacao
                .toUpperCase()
                .includes("COMISSÃO GESTORA"));

          if (isComissaoGestora && responsavel.setor) {
            orgChave = responsavel.setor;
          } else {
            orgChave = responsavel.organizacao || "Geral";
          }

          if (!acc[grupo]) acc[grupo] = {};
          if (!acc[grupo][orgChave]) acc[grupo][orgChave] = [];
          acc[grupo][orgChave].push(responsavel);
          return acc;
        }, {});

        setGroupedData(grouped);
      } catch (err) {
        console.error("Erro ao buscar responsáveis:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    };

    getResponsaveisData();
  }, [selectedReservoir]);

  // 1. ESTADO: NADA SELECIONADO
  if (!selectedReservoir) {
    return (
      <EmptyReservoirState
        title="Estrutura de Responsáveis Indisponível"
        description="Por favor, selecione um hidrossistema no seletor acima para visualizar as instituições e técnicos responsáveis."
      />
    );
  }

  // 2. ESTADO: CARREGANDO
  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            Carregando estrutura de responsáveis...
          </p>
        </div>
      </main>
    );
  }

  // 3. ESTADO: ERRO NA API
  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="text-center p-8 bg-card border rounded-xl shadow-sm max-w-lg">
          <h1 className="text-2xl font-semibold text-destructive mb-2">
            Erro ao carregar responsáveis
          </h1>
          <p className="text-muted-foreground">
            Ocorreu um problema ao buscar a estrutura institucional: {error}
          </p>
        </div>
      </main>
    );
  }

  const sortedGrupos = Object.keys(groupedData).sort((a, b) => {
    const indexA = grupoDisplayOrder.indexOf(a);
    const indexB = grupoDisplayOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // 4. ESTADO: SUCESSO
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-6 bg-background">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Responsáveis
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {selectedReservoir.nome}
        </h1>
      </div>

      {sortedGrupos.map((grupo) => {
        const organizacoes = groupedData[grupo];
        const organizacaoOrderList = organizacaoOrder[grupo] || null;

        const sortedOrganizacoes = Object.keys(organizacoes).sort((a, b) => {
          if (!organizacaoOrderList) return a.localeCompare(b);
          const indexA = organizacaoOrderList.indexOf(a);
          const indexB = organizacaoOrderList.indexOf(b);
          if (indexA === -1 && indexB === -1) return a.localeCompare(b);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        const isComissaoGestora = grupo
          .toUpperCase()
          .includes("COMISSÃO GESTORA");

        return (
          <section key={grupo} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Users2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold uppercase tracking-wide">
                {grupo}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedOrganizacoes.map((orgChave) => {
                const membros = organizacoes[orgChave];
                const primeiroMembro = membros[0];

                let tituloCard = orgChave;
                let badgeTexto = null;

                if (isComissaoGestora) {
                  tituloCard = orgChave;
                } else if (
                  primeiroMembro?.setor &&
                  primeiroMembro.setor !== orgChave
                ) {
                  badgeTexto = primeiroMembro.setor;
                }

                return (
                  <div
                    key={orgChave}
                    className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 border-b border-border/40 bg-muted/30">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold flex items-center gap-2 uppercase">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            {tituloCard}
                          </h3>
                          {badgeTexto && (
                            <Badge
                              variant="secondary"
                              className="font-normal text-[10px] py-0"
                            >
                              {badgeTexto}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 pt-5">
                      <MemberList members={membros} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-center md:text-left">
          Financiamento e Realização
        </h2>
        <div className="bg-muted/20 rounded-xl p-6">
          <Parceiros />
        </div>
      </section>
    </main>
  );
}
