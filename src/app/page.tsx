"use client";

import { useState } from "react";
import { BusquedaPorNegocio } from "@/components/busqueda-por-negocio";
import { BusquedaPorRubro } from "@/components/busqueda-por-rubro";
import { Container } from "@/components/ui";

const TABS = [
  { id: "negocio", label: "Por negocio" },
  { id: "rubro", label: "Por rubro" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Home() {
  const [tab, setTab] = useState<TabId>("negocio");

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <Container className="flex items-center justify-between gap-4">
          <h1 className="text-base font-semibold text-foreground">
            we check it
          </h1>
          <nav className="-mb-px flex gap-5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap border-b-2 py-4 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </Container>
      </header>

      <Container className="flex flex-col gap-6 py-6 sm:py-8">
        <div hidden={tab !== "negocio"}>
          <BusquedaPorNegocio />
        </div>

        <div hidden={tab !== "rubro"}>
          <BusquedaPorRubro />
        </div>
      </Container>
    </div>
  );
}
