// src/components/responsaveis/grouping.ts
// Agrupamento e ordem de exibição dos responsáveis (regras vindas da tela anterior).
import type { Responsavel } from "@/lib/types";

export type GroupedData = {
  [grupo: string]: {
    [organizacao: string]: Responsavel[];
  };
};

// Ordem de exibição dos grupos conforme solicitado
export const GRUPO_ORDER: string[] = [
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

export const ORGANIZACAO_ORDER: { [key: string]: string[] } = {
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

export function groupResponsaveis(data: Responsavel[]): GroupedData {
  return data.reduce<GroupedData>((acc, responsavel) => {
    const grupo = responsavel.grupo || "Outros Grupos";
    const isComissaoGestora =
      grupo.toUpperCase().includes("COMISSÃO GESTORA") ||
      (responsavel.organizacao && responsavel.organizacao.toUpperCase().includes("COMISSÃO GESTORA"));
    const orgChave = isComissaoGestora && responsavel.setor ? responsavel.setor : responsavel.organizacao || "Geral";
    if (!acc[grupo]) acc[grupo] = {};
    if (!acc[grupo][orgChave]) acc[grupo][orgChave] = [];
    acc[grupo][orgChave].push(responsavel);
    return acc;
  }, {});
}

function byOrder(order: string[] | null) {
  return (a: string, b: string) => {
    if (!order) return a.localeCompare(b);
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  };
}

export const sortGrupos = (grupos: string[]) => [...grupos].sort(byOrder(GRUPO_ORDER));

export const sortOrganizacoes = (grupo: string, orgs: string[]) =>
  [...orgs].sort(byOrder(ORGANIZACAO_ORDER[grupo] ?? null));
