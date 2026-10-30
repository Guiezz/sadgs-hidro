"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { droughtLabel, normalizeDroughtState } from "@/lib/drought-state";
import { activeFilterChips, type PlanFilterState } from "./filters";

interface PlanFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  filters: PlanFilterState;
  onFilterChange: (key: keyof PlanFilterState, value: string) => void;
  onReset: () => void;
  options: { estados: string[]; impactos: string[]; problemas: string[]; classes: string[] };
}

const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();

function estadoLabel(raw: string) {
  const key = normalizeDroughtState(raw);
  return key ? droughtLabel(key) : oneLine(raw);
}

const selectCls =
  "h-11 w-full appearance-none truncate rounded-[10px] border border-input bg-card pr-9 pl-3 text-sm font-medium text-foreground";

function FilterSelect({
  id,
  label,
  value,
  options,
  format = oneLine,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  format?: (s: string) => string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
          <option value="">Todos</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {format(o)}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-3.5 right-3 size-4 text-label"
        />
      </div>
    </div>
  );
}

export function PlanFilters({ query, onQueryChange, filters, onFilterChange, onReset, options }: PlanFiltersProps) {
  const chips = activeFilterChips({
    ...filters,
    estado: filters.estado ? estadoLabel(filters.estado) : "",
    problema: filters.problema ? oneLine(filters.problema) : "",
  });
  const hasAny = chips.length > 0 || query.trim() !== "";

  return (
    <form
      role="search"
      aria-label="Filtrar planos de ação"
      onSubmit={(e) => e.preventDefault()}
      onReset={(e) => {
        e.preventDefault();
        onReset();
      }}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-[22px] py-5"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="busca" className="text-[13px] font-semibold text-muted-foreground">
          Buscar ação
        </label>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-label" />
          <input
            id="busca"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Ex.: poços, mata ciliar, COGERH"
            className="h-11 w-full rounded-[10px] border border-input bg-background pr-3.5 pl-[42px] text-[15px] placeholder:text-label"
          />
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-3">
        <FilterSelect
          id="f-estado"
          label="Estado de seca"
          value={filters.estado ?? ""}
          options={options.estados}
          format={estadoLabel}
          onChange={(v) => onFilterChange("estado", v)}
        />
        <FilterSelect
          id="f-impacto"
          label="Tipo de impacto"
          value={filters.impacto ?? ""}
          options={options.impactos}
          onChange={(v) => onFilterChange("impacto", v)}
        />
        <FilterSelect
          id="f-problema"
          label="Problema"
          value={filters.problema ?? ""}
          options={options.problemas}
          onChange={(v) => onFilterChange("problema", v)}
        />
        <FilterSelect
          id="f-classe"
          label="Classe da ação"
          value={filters.classe ?? ""}
          options={options.classes}
          onChange={(v) => onFilterChange("classe", v)}
        />
      </div>
      {hasAny && (
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <ul aria-label="Filtros ativos" className="m-0 flex list-none flex-wrap gap-2 p-0">
            {chips.map((chip) => (
              <li
                key={chip.key}
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-accent pl-3 text-[13px] font-semibold text-link-hover"
              >
                <span className="truncate">{chip.label}</span>
                <button
                  type="button"
                  aria-label={`Remover filtro ${chip.label}`}
                  onClick={() => onFilterChange(chip.key, "")}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-[var(--estado-seca-bg)]"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <button type="reset" className="h-10 rounded-[10px] px-3.5 text-sm font-semibold text-link hover:bg-muted">
            Limpar filtros
          </button>
        </div>
      )}
    </form>
  );
}
