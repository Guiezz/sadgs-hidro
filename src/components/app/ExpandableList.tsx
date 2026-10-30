"use client";

import { useState } from "react";

// Lista com marcadores que mostra `visible` itens e abre o restante sob demanda.
export function ExpandableList({
  id,
  items,
  visible = 5,
  noun,
}: {
  id: string;
  items: string[];
  visible?: number;
  noun: [singular: string, plural: string];
}) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) {
    return <p className="m-0 text-sm text-muted-foreground">Sem itens cadastrados.</p>;
  }

  const shown = open ? items : items.slice(0, visible);
  const hidden = items.length - visible;

  return (
    <div className="flex flex-col gap-2.5">
      <ul id={id} className="m-0 flex list-disc flex-col gap-1.5 pl-[18px] marker:text-label text-sm leading-normal">
        {shown.map((item, i) => (
          <li key={i} className="texto-corrido">
            {item}
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="-ml-3 min-h-11 self-start rounded-lg px-3 text-sm font-semibold text-link hover:bg-muted"
        >
          {open ? "Ver menos" : `Ver mais ${hidden} ${hidden === 1 ? noun[0] : noun[1]}`}
        </button>
      )}
    </div>
  );
}
