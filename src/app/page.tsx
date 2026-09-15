"use client";

import { useState, type FormEvent } from "react";
import type { NegocioBusqueda } from "@/lib/types";
import { CIUDADES } from "@/lib/constantes";
import { ejecutarConLimite } from "@/lib/concurrencia";
import { useAuditorias } from "@/hooks/use-auditorias";
import { Button } from "@/components/ui";
import { NegocioCard } from "@/components/negocio-card";

const LIMITE_AUDITORIAS_PARALELAS = 3;

export default function Home() {
  const [rubro, setRubro] = useState("");
  const [ciudad, setCiudad] = useState(CIUDADES[0]);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [negocios, setNegocios] = useState<NegocioBusqueda[]>([]);
  const { auditorias, gbp, inicializarEstados, auditarNegocio, cargarGbp } =
    useAuditorias();

  async function handleBuscar(e: FormEvent) {
    e.preventDefault();
    if (!rubro.trim()) return;

    setBuscando(true);
    setErrorBusqueda(null);
    setNegocios([]);

    try {
      const res = await fetch(
        `/api/search-negocios?rubro=${encodeURIComponent(rubro)}&zona=${encodeURIComponent(ciudad)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error buscando negocios.");

      const resultado = data.negocios as NegocioBusqueda[];
      setNegocios(resultado);
      inicializarEstados(resultado);

      const conWeb = resultado.filter((n) => n.websiteUri);
      ejecutarConLimite(conWeb, LIMITE_AUDITORIAS_PARALELAS, auditarNegocio);
    } catch (err) {
      setErrorBusqueda(
        err instanceof Error ? err.message : "Error desconocido",
      );
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-foreground px-6 py-4">
        <h1 className="text-lg font-semibold text-background">we-audit</h1>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
        <form
          onSubmit={handleBuscar}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end"
        >
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Rubro</label>
            <input
              value={rubro}
              onChange={(e) => setRubro(e.target.value)}
              placeholder="ej. panadería"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">
              Ciudad
            </label>
            <select
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {CIUDADES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={buscando || !rubro.trim()}>
            {buscando ? "Buscando…" : "Buscar negocios"}
          </Button>
        </form>

        {errorBusqueda && (
          <p className="text-sm text-red-600">{errorBusqueda}</p>
        )}

        {negocios.length > 0 && (
          <p className="text-sm text-muted">
            {negocios.length} negocios encontrados
          </p>
        )}

        <div className="flex flex-col gap-4">
          {negocios.map((negocio) => (
            <NegocioCard
              key={negocio.placeId}
              negocio={negocio}
              estado={auditorias[negocio.placeId] ?? { status: "sin-web" }}
              estadoGbp={gbp[negocio.placeId] ?? { status: "idle" }}
              onReintentarAuditoria={auditarNegocio}
              onVerGbp={cargarGbp}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
