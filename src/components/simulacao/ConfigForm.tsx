"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Play, Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CenarioDemanda } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const PREDEFINED_SCENARIOS: CenarioDemanda[] = [
  { nome: "Base (100%)", percentual: 100 },
  { nome: "Redução 10%", percentual: 90 },
  { nome: "Redução 20%", percentual: 80 },
  { nome: "Redução 30%", percentual: 70 },
];

interface ConfigFormProps {
  selectedReservoirName: string;
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
  volumeAtualPct: number | null;
  demandaAtualM3s: number | null;
}

const label = "text-[13px] font-semibold text-muted-foreground";
const input =
  "h-11 w-full rounded-[10px] border border-input bg-background px-3.5 text-[15px] font-medium text-foreground disabled:opacity-50";
const ghost = "h-9 rounded-lg px-2.5 text-[13px] font-semibold text-link hover:bg-muted disabled:opacity-40";

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
  volumeAtualPct,
  demandaAtualM3s,
}: ConfigFormProps) {
  const [nomeCenario, setNomeCenario] = useState("");
  const [percentualInput, setPercentualInput] = useState("85");
  const [erroCenario, setErroCenario] = useState<string | null>(null);

  const togglePredefined = (cenario: CenarioDemanda, checked: boolean) => {
    if (checked) {
      setCenariosDemanda([...cenariosDemanda, cenario]);
    } else {
      setCenariosDemanda(cenariosDemanda.filter((c) => c.nome !== cenario.nome));
    }
  };

  const isPredefinedChecked = (nome: string) => cenariosDemanda.some((c) => c.nome === nome);

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
  const disabled = !selectedAcudeId;
  const volHm3 = capacidadeTotal > 0 && volPercentual ? (parseFloat(volPercentual) / 100) * capacidadeTotal : null;

  return (
    <form
      aria-labelledby="cfg-titulo"
      onSubmit={(e) => {
        e.preventDefault();
        onSimular();
      }}
      className="flex h-fit flex-col gap-5 rounded-[20px] border border-border bg-card p-6 lg:sticky lg:top-6"
    >
      <h2 id="cfg-titulo" className="m-0 text-lg font-bold">
        Configuração
      </h2>

      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className={cn(label, "mb-2")}>Modo de simulação</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "unico" as const, title: "Cenário único", hint: "Uma demanda, um período" },
            { value: "comparacao" as const, title: "Comparação", hint: "Várias demandas lado a lado" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer flex-col gap-1 rounded-xl border border-input bg-background p-3 hover:border-border-strong has-[input:checked]:border-secondary has-[input:checked]:bg-card has-[input:checked]:shadow-[0_0_0_1px_var(--secondary)]"
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="radio"
                  name="modo"
                  value={opt.value}
                  checked={modoSimulacao === opt.value}
                  onChange={() => setModoSimulacao(opt.value)}
                  className="size-4 accent-[var(--secondary)]"
                />
                {opt.title}
              </span>
              <span className="text-xs text-muted-foreground">{opt.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1 rounded-xl bg-background px-4 py-3">
        <span className="text-xs font-semibold text-label">Reservatório</span>
        <span className="text-[15px] font-bold">{selectedReservoirName || "Selecione no topo da página"}</span>
        {capacidadeTotal > 0 && (
          <span className="text-xs text-muted-foreground">
            Capacidade máxima: {formatNumber(capacidadeTotal)} hm³
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="vol" className={label}>
            Volume inicial
          </label>
          <button
            type="button"
            className={ghost}
            disabled={disabled || volumeAtualPct === null}
            onClick={() => volumeAtualPct !== null && setVolPercentual(volumeAtualPct.toFixed(1))}
          >
            Usar volume atual{volumeAtualPct !== null ? ` (${formatNumber(volumeAtualPct, 1)}%)` : ""}
          </button>
        </div>
        <div className="relative">
          <input
            id="vol"
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            value={volPercentual}
            onChange={(e) => setVolPercentual(e.target.value)}
            aria-describedby="vol-hint"
            disabled={disabled}
            className={cn(input, "pr-9")}
          />
          <span aria-hidden="true" className="absolute top-3 right-3.5 text-sm text-label">
            %
          </span>
        </div>
        <span id="vol-hint" className="text-xs text-muted-foreground">
          {volHm3 !== null && !Number.isNaN(volHm3) ? `= ${formatNumber(volHm3)} hm³` : "Percentual da capacidade"}
        </span>
      </div>

      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className={cn(label, "mb-2")}>Período da série histórica</legend>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="de" className="text-xs text-muted-foreground">
              De
            </label>
            <input
              id="de"
              type="date"
              min={`${anoMin}-01-01`}
              max={`${anoMax}-12-31`}
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
              disabled={disabled}
              className={cn(input, "px-2.5 text-sm")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="ate" className="text-xs text-muted-foreground">
              Até
            </label>
            <input
              id="ate"
              type="date"
              min={`${anoMin}-01-01`}
              max={`${anoMax}-12-31`}
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
              disabled={disabled}
              className={cn(input, "px-2.5 text-sm")}
            />
          </div>
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="dem" className={label}>
            Demanda
          </label>
          <button
            type="button"
            className={ghost}
            disabled={disabled || demandaAtualM3s === null}
            onClick={() => demandaAtualM3s !== null && setDemanda(String(demandaAtualM3s))}
          >
            Usar demanda atual
          </button>
        </div>
        <div className="relative">
          <input
            id="dem"
            type="number"
            inputMode="decimal"
            step="0.001"
            value={demanda}
            onChange={(e) => setDemanda(e.target.value)}
            aria-describedby="dem-hint"
            disabled={disabled}
            placeholder="Ex.: 0,748"
            className={cn(input, "pr-14")}
          />
          <span aria-hidden="true" className="absolute top-3 right-3.5 text-sm text-label">
            m³/s
          </span>
        </div>
        <span id="dem-hint" className="text-xs text-muted-foreground">
          {demandaAtualM3s !== null
            ? `Demanda total cadastrada: ${formatNumber(demandaAtualM3s, 3)} m³/s (${formatNumber(demandaAtualM3s * 1000, 0)} L/s)`
            : "Vazão retirada do reservatório"}
        </span>
      </div>

      {isComparacao && (
        <fieldset className="m-0 flex flex-col gap-3 border-0 border-t border-border p-0 pt-4">
          <legend className="sr-only">Cenários de demanda</legend>
          <span className={label}>Cenários pré-definidos</span>
          {PREDEFINED_SCENARIOS.map((pre) => (
            <div key={pre.nome} className="flex min-h-8 items-center gap-2.5">
              <Checkbox
                id={`pre-${pre.nome}`}
                checked={isPredefinedChecked(pre.nome)}
                onCheckedChange={(checked) => togglePredefined(pre, !!checked)}
                disabled={disabled}
              />
              <label htmlFor={`pre-${pre.nome}`} className="cursor-pointer text-sm">
                {pre.nome}
              </label>
            </div>
          ))}

          <span className={cn(label, "border-t border-border pt-3")}>Criar cenário personalizado</span>
          <div className="flex flex-col gap-1">
            <label htmlFor="cen-nome" className="text-xs text-muted-foreground">
              Nome
            </label>
            <input
              id="cen-nome"
              placeholder="Ex.: Restrição moderada"
              value={nomeCenario}
              onChange={(e) => setNomeCenario(e.target.value)}
              disabled={disabled}
              className={input}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="cen-perc" className="text-xs text-muted-foreground">
              Percentual da demanda
            </label>
            <div className="relative">
              <input
                id="cen-perc"
                type="number"
                min="0"
                max="200"
                step="5"
                value={percentualInput}
                onChange={(e) => setPercentualInput(e.target.value)}
                disabled={disabled}
                className={cn(input, "pr-9")}
              />
              <span aria-hidden="true" className="absolute top-3 right-3.5 text-sm text-label">
                %
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAdicionarCustom}
            disabled={disabled}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[10px] border border-input bg-card text-sm font-semibold hover:bg-muted disabled:opacity-50"
          >
            <Plus aria-hidden="true" className="size-4" />
            Adicionar cenário
          </button>
          {erroCenario && (
            <p role="alert" className="m-0 flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle aria-hidden="true" className="size-3.5" />
              {erroCenario}
            </p>
          )}

          {cenariosDemanda.length > 0 && (
            <ul aria-label="Cenários selecionados" className="m-0 flex list-none flex-col gap-2 p-0">
              {cenariosDemanda.map((c) => (
                <li
                  key={c.nome}
                  className="flex items-center justify-between gap-2 rounded-xl border border-accent-border bg-accent py-2 pr-1 pl-3 text-sm"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{c.nome}</span>
                    <span className="text-xs text-link-hover">{c.percentual}% da demanda</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemover(c.nome)}
                    aria-label={`Remover cenário ${c.nome}`}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-link-hover hover:bg-[var(--estado-seca-bg)]"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      )}

      <button
        type="submit"
        disabled={simulating || disabled}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-primary text-[15px] font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {simulating ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Processando…
          </>
        ) : (
          <>
            <Play aria-hidden="true" className="size-4" />
            {isComparacao
              ? `Simular ${cenariosDemanda.length} ${cenariosDemanda.length === 1 ? "cenário" : "cenários"}`
              : "Gerar simulação"}
          </>
        )}
      </button>

      {error && (
        <div role="alert" className="flex gap-2 rounded-xl border border-destructive/30 bg-estado-severa-bg p-3 text-sm text-estado-severa-text">
          <AlertCircle aria-hidden="true" className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}
