"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Calendar,
  AlertCircle,
  Database,
  Layers,
  Plus,
  X,
  BarChart3,
} from "lucide-react";
import { CenarioDemanda } from "@/lib/types";

const PREDEFINED_SCENARIOS: CenarioDemanda[] = [
  { nome: "Base (100%)", percentual: 100 },
  { nome: "Redução 10%", percentual: 90 },
  { nome: "Redução 20%", percentual: 80 },
  { nome: "Redução 30%", percentual: 70 },
];

interface ConfigFormProps {
  selectedReservoirName?: string;
  selectedAcudeId: string;
  capacidadeTotal: number;
  volPercentual: string;
  setVolPercentual: (val: string) => void;
  filtroDataInicio: string;
  setFiltroDataInicio: (val: string) => void;
  filtroDataFim: string;
  setFiltroDataFim: (val: string) => void;
  demanda: string;
  setDemanda: (val: string) => void;
  onSimular: () => void;
  simulating: boolean;
  error: string | null;
  anoMin: number;
  anoMax: number;
  modoSimulacao: "unico" | "comparacao";
  setModoSimulacao: (modo: "unico" | "comparacao") => void;
  cenariosDemanda: CenarioDemanda[];
  setCenariosDemanda: (cenarios: CenarioDemanda[]) => void;
}

export function ConfigForm({
  selectedReservoirName,
  selectedAcudeId,
  capacidadeTotal,
  volPercentual,
  setVolPercentual,
  filtroDataInicio,
  setFiltroDataInicio,
  filtroDataFim,
  setFiltroDataFim,
  demanda,
  setDemanda,
  onSimular,
  simulating,
  error,
  anoMin,
  anoMax,
  modoSimulacao,
  setModoSimulacao,
  cenariosDemanda,
  setCenariosDemanda,
}: ConfigFormProps) {
  const [nomeCenario, setNomeCenario] = useState("");
  const [percentualInput, setPercentualInput] = useState("85");
  const [erroCenario, setErroCenario] = useState<string | null>(null);

  const togglePredefined = (cenario: CenarioDemanda, checked: boolean) => {
    if (checked) {
      setCenariosDemanda([...cenariosDemanda, cenario]);
    } else {
      setCenariosDemanda(
        cenariosDemanda.filter((c) => c.nome !== cenario.nome),
      );
    }
  };

  const isPredefinedChecked = (nome: string) =>
    cenariosDemanda.some((c) => c.nome === nome);

  const handleAdicionarCustom = () => {
    setErroCenario(null);

    const nome = nomeCenario.trim();
    if (!nome) {
      setErroCenario("Informe um nome para o cenário.");
      return;
    }
    if (cenariosDemanda.some((c) => c.nome === nome)) {
      setErroCenario("Já existe um cenário com este nome.");
      return;
    }

    const perc = parseFloat(percentualInput);
    if (isNaN(perc) || perc <= 0 || perc > 200) {
      setErroCenario("Percentual deve ser entre 0 e 200.");
      return;
    }

    setCenariosDemanda([...cenariosDemanda, { nome, percentual: perc }]);
    setNomeCenario("");
    setPercentualInput("85");
  };

  const handleRemover = (nome: string) => {
    setCenariosDemanda(cenariosDemanda.filter((c) => c.nome !== nome));
  };

  const isComparacao = modoSimulacao === "comparacao";

  return (
    <Card className="border-l-4 border-l-amber-500 shadow-sm h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Configuração</CardTitle>
        <CardDescription>
          {isComparacao
            ? `${cenariosDemanda.length} cenário(s) de demanda`
            : `Simulação para ${selectedReservoirName || "..."}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* MODO DE SIMULAÇÃO */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Modo de Simulação
          </Label>
          <RadioGroup
            value={modoSimulacao}
            onValueChange={(val) =>
              setModoSimulacao(val as "unico" | "comparacao")
            }
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="unico" id="modo-unico" />
              <Label htmlFor="modo-unico" className="text-sm font-normal cursor-pointer">
                Cenário Único
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="comparacao" id="modo-comparacao" />
              <Label htmlFor="modo-comparacao" className="text-sm font-normal cursor-pointer">
                Comparação
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* RESERVATÓRIO */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            Reservatório Selecionado
          </Label>
          <div
            className={`p-3 rounded-md border text-sm font-medium ${selectedReservoirName ? "bg-blue-50 text-amber-900 border-blue-100" : "bg-slate-100 text-slate-500"}`}
          >
            {selectedReservoirName || "Selecione no Menu Lateral"}
          </div>
          {capacidadeTotal > 0 && (
            <p className="text-xs text-muted-foreground">
              Capacidade Máx: <strong>{capacidadeTotal.toFixed(2)} hm³</strong>
            </p>
          )}
        </div>

        {/* VOLUME INICIAL */}
        <div className="space-y-2">
          <Label>Volume Inicial (%)</Label>
          <div className="relative">
            <Input
              type="number"
              min="0"
              max="100"
              value={volPercentual}
              onChange={(e) => setVolPercentual(e.target.value)}
              className="pr-8"
              disabled={!selectedAcudeId}
            />
            <span className="absolute right-3 top-2 text-sm text-muted-foreground">
              %
            </span>
          </div>
          {capacidadeTotal > 0 && volPercentual && (
            <p className="text-xs text-amber-600-500">
              ={" "}
              {((parseFloat(volPercentual) / 100) * capacidadeTotal).toFixed(2)}{" "}
              hm³
            </p>
          )}
        </div>

        {/* PERÍODO */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Filtrar por período
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">De</span>
              <Input
                type="date"
                min={`${anoMin}-01-01`}
                max={`${anoMax}-12-31`}
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
                disabled={!selectedAcudeId}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Até</span>
              <Input
                type="date"
                min={`${anoMin}-01-01`}
                max={`${anoMax}-12-31`}
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
                disabled={!selectedAcudeId}
              />
            </div>
          </div>
        </div>

        {/* DEMANDA */}
        <div className="space-y-2">
          <Label>Demanda (m³/s)</Label>
          <Input
            type="number"
            step="0.1"
            value={demanda}
            onChange={(e) => setDemanda(e.target.value)}
            disabled={!selectedAcudeId}
          />
        </div>

        {/* COMPARAÇÃO DE DEMANDAS */}
        {isComparacao && (
          <div className="space-y-3 pt-2 border-t">
            <Label className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Comparar Demandas
            </Label>

            {/* Pré-definidos */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                Cenários pré-definidos
              </span>
              {PREDEFINED_SCENARIOS.map((pre) => (
                <div key={pre.nome} className="flex items-center gap-2">
                  <Checkbox
                    id={`pre-${pre.nome}`}
                    checked={isPredefinedChecked(pre.nome)}
                    onCheckedChange={(checked) =>
                      togglePredefined(pre, !!checked)
                    }
                    disabled={!selectedAcudeId}
                  />
                  <Label
                    htmlFor={`pre-${pre.nome}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {pre.nome}
                  </Label>
                </div>
              ))}
            </div>

            {/* Criar personalizado */}
            <div className="space-y-2 pt-2 border-t">
              <span className="text-xs font-medium text-muted-foreground">
                Criar cenário personalizado
              </span>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Nome</span>
                <Input
                  placeholder="Ex: Restrição Moderada"
                  value={nomeCenario}
                  onChange={(e) => setNomeCenario(e.target.value)}
                  disabled={!selectedAcudeId}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">
                  Percentual da Demanda
                </span>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="200"
                    step="5"
                    value={percentualInput}
                    onChange={(e) => setPercentualInput(e.target.value)}
                    className="pr-8"
                    disabled={!selectedAcudeId}
                  />
                  <span className="absolute right-3 top-2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1"
                onClick={handleAdicionarCustom}
                disabled={!selectedAcudeId}
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
              {erroCenario && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {erroCenario}
                </p>
              )}
            </div>

            {/* Lista de cenários ativos */}
            {cenariosDemanda.length > 0 && (
              <div className="space-y-2 mt-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Cenários selecionados ({cenariosDemanda.length})
                </span>
                {cenariosDemanda.map((c) => (
                  <div
                    key={c.nome}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-md border border-amber-200 bg-amber-50 text-sm"
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-amber-900 block truncate">
                        {c.nome}
                      </span>
                      <span className="text-xs text-amber-700">
                        {c.percentual}% da demanda
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemover(c.nome)}
                      className="shrink-0 p-1 rounded hover:bg-amber-200 text-amber-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOTÃO SIMULAR */}
        <Button
          className="w-full bg-amber-500 hover:bg-amber-800 text-amber-50"
          onClick={onSimular}
          disabled={simulating || !selectedAcudeId}
        >
          {simulating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
            </>
          ) : isComparacao ? (
            `Simular ${cenariosDemanda.length} Cenários`
          ) : (
            "Gerar Simulação"
          )}
        </Button>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md flex gap-2 border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
