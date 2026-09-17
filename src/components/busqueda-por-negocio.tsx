"use client";

import { useState, type FormEvent } from "react";
import type { NegocioBusqueda } from "@/lib/types";
import { CIUDADES } from "@/lib/constantes";
import { negocioDesdeUrl, normalizarUrl } from "@/lib/negocio";
import { useAuditorias } from "@/hooks/use-auditorias";
import { Badge, Button, Card } from "@/components/ui";
import { NegocioCard } from "@/components/negocio-card";

type Modo = "url" | "nombre";

function esSintetico(negocio: NegocioBusqueda) {
  return negocio.placeId.startsWith("url:");
}

export function BusquedaPorNegocio() {
  const [modo, setModo] = useState<Modo>("url");
  const [url, setUrl] = useState("");
  const [nombre, setNombre] = useState("");
  const [ciudad, setCiudad] = useState(CIUDADES[0]);
  const [direccion, setDireccion] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [candidatos, setCandidatos] = useState<NegocioBusqueda[] | null>(null);
  const [seleccionado, setSeleccionado] = useState<NegocioBusqueda | null>(
    null,
  );
  const { auditorias, gbp, auditarNegocio, cargarGbp } = useAuditorias();

  function elegir(negocio: NegocioBusqueda) {
    setSeleccionado(negocio);
    auditarNegocio(negocio);
    if (!esSintetico(negocio)) {
      cargarGbp(negocio);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorBusqueda(null);

    if (modo === "url") {
      if (!url.trim()) return;
      setCandidatos(null);
      elegir(negocioDesdeUrl(normalizarUrl(url)));
      return;
    }

    if (!nombre.trim() || !ciudad.trim()) return;

    setBuscando(true);
    setSeleccionado(null);
    setCandidatos(null);

    try {
      const params = new URLSearchParams({ nombre, ciudad });
      if (direccion.trim()) params.set("direccion", direccion.trim());
      const res = await fetch(`/api/buscar-negocio?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error buscando negocios.");
      setCandidatos(data.negocios as NegocioBusqueda[]);
    } catch (err) {
      setErrorBusqueda(
        err instanceof Error ? err.message : "Error desconocido",
      );
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:p-5"
      >
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="modo"
              checked={modo === "url"}
              onChange={() => setModo("url")}
              className="accent-primary"
            />
            Por sitio web
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setModo("url")}
            placeholder="URL del sitio web"
            disabled={modo !== "url"}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
          />

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="modo"
              checked={modo === "nombre"}
              onChange={() => setModo("nombre")}
              className="accent-primary"
            />
            Por nombre y ciudad
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onFocus={() => setModo("nombre")}
              placeholder="Nombre del negocio"
              disabled={modo !== "nombre"}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
            />
            <select
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              onFocus={() => setModo("nombre")}
              disabled={modo !== "nombre"}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
            >
              {CIUDADES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              onFocus={() => setModo("nombre")}
              placeholder="Dirección (opcional)"
              disabled={modo !== "nombre"}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={
            buscando ||
            (modo === "url" ? !url.trim() : !nombre.trim() || !ciudad.trim())
          }
          className="self-start"
        >
          {buscando ? "Buscando…" : "Auditar"}
        </Button>
      </form>

      {errorBusqueda && (
        <p className="text-sm text-danger">{errorBusqueda}</p>
      )}

      {seleccionado && (
        <div className="flex flex-col gap-2">
          {candidatos && (
            <button
              type="button"
              onClick={() => setSeleccionado(null)}
              className="self-start text-xs text-primary underline underline-offset-2"
            >
              ‹ Volver a resultados
            </button>
          )}
          <NegocioCard
            negocio={seleccionado}
            estado={auditorias[seleccionado.placeId] ?? { status: "cargando" }}
            estadoGbp={gbp[seleccionado.placeId] ?? { status: "idle" }}
            onReintentarAuditoria={auditarNegocio}
            onVerGbp={cargarGbp}
            mostrarGbp={!esSintetico(seleccionado)}
          />
        </div>
      )}

      {!seleccionado && candidatos && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            {candidatos.length} negocios encontrados
          </p>
          {candidatos.map((c) => (
            <Card
              key={c.placeId}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="truncate font-semibold text-foreground">
                  {c.nombre}
                </h3>
                {c.direccion && (
                  <p className="truncate text-sm text-muted">{c.direccion}</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {c.primaryType && <Badge>{c.primaryType}</Badge>}
                  {c.rating != null && (
                    <span className="text-sm text-muted">
                      {c.rating.toFixed(1)}★ ({c.userRatingCount ?? 0})
                    </span>
                  )}
                </div>
              </div>
              {c.websiteUri ? (
                <Button
                  variant="outline"
                  className="self-start sm:self-auto"
                  onClick={() => elegir(c)}
                >
                  Auditar
                </Button>
              ) : (
                <Badge tone="warn" className="self-start sm:self-auto">
                  Sin sitio web
                </Badge>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
