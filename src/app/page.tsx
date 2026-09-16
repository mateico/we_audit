"use client";

import { useState } from "react";
import { BusquedaPorNegocio } from "@/components/busqueda-por-negocio";
import { BusquedaPorRubro } from "@/components/busqueda-por-rubro";

const TABS = [
  { id: "negocio", label: "Por negocio" },
  { id: "rubro", label: "Por rubro" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Home() {
  const [tab, setTab] = useState<TabId>("negocio");

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border bg-foreground px-6 py-4">
        <h1 className="text-lg font-semibold text-background">we-audit</h1>
        <nav className="flex gap-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-sm font-medium transition-colors ${
                tab === t.id
                  ? "text-background underline underline-offset-4"
                  : "text-background/60 hover:text-background"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
        <div hidden={tab !== "negocio"}>
          <BusquedaPorNegocio />
        </div>

        <div hidden={tab !== "rubro"}>
          <BusquedaPorRubro />
        </div>
      </main>
    </div>
  );
}
