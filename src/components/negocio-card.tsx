"use client";

import { useEffect, useState } from "react";
import type { Bloque1Tecnico, Bloque2Gbp, NegocioBusqueda } from "@/lib/types";
import { Badge, Button, Card, ScoreGauge } from "./ui";

export type EstadoAuditoria =
  | { status: "sin-web" }
  | { status: "cargando" }
  | { status: "listo"; data: Bloque1Tecnico }
  | { status: "error"; mensaje: string };

export type EstadoGbp =
  | { status: "idle" }
  | { status: "cargando" }
  | { status: "listo"; data: Bloque2Gbp }
  | { status: "error"; mensaje: string };

const PASOS_AUDITORIA = [
  "Analizando SEO on-page…",
  "Verificando datos de contacto (NAP)…",
  "Midiendo velocidad de carga…",
];

function ProgresoAuditoria() {
  const [paso, setPaso] = useState(0);
  const total = PASOS_AUDITORIA.length;

  useEffect(() => {
    if (paso >= total - 1) return;
    const id = setTimeout(() => setPaso((p) => p + 1), 1800);
    return () => clearTimeout(id);
  }, [paso, total]);

  return (
    <div className="flex w-32 flex-col items-center gap-1 text-xs text-muted">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
      <span className="text-center">{PASOS_AUDITORIA[paso]}</span>
      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${((paso + 1) / total) * 100}%` }}
        />
      </div>
      <span>
        {paso + 1}/{total}
      </span>
    </div>
  );
}

export function NegocioCard({
  negocio,
  estado,
  estadoGbp,
  onReintentarAuditoria,
  onVerGbp,
  mostrarGbp = true,
}: {
  negocio: NegocioBusqueda;
  estado: EstadoAuditoria;
  estadoGbp: EstadoGbp;
  onReintentarAuditoria: (negocio: NegocioBusqueda) => void;
  onVerGbp: (negocio: NegocioBusqueda) => void;
  mostrarGbp?: boolean;
}) {
  const [detalleAbierto, setDetalleAbierto] = useState(false);

  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="truncate font-semibold text-foreground">
          {negocio.nombre}
        </h3>
        {negocio.direccion && (
          <p className="truncate text-sm text-muted">{negocio.direccion}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {negocio.primaryType && <Badge>{negocio.primaryType}</Badge>}
          {negocio.telefono && (
            <span className="text-sm text-muted">Tel: {negocio.telefono}</span>
          )}
        </div>
        {negocio.websiteUri ? (
          <a
            href={negocio.websiteUri}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm text-primary underline underline-offset-2"
          >
            {negocio.websiteUri}
          </a>
        ) : (
          <Badge tone="warn">Sin sitio web</Badge>
        )}
      </div>

      <div className="flex w-full flex-col items-center gap-2 sm:w-auto">
        {estado.status === "sin-web" && (
          <Badge tone="neutral">No auditable</Badge>
        )}

        {estado.status === "cargando" && <ProgresoAuditoria />}

        {estado.status === "error" && (
          <div className="flex flex-col items-center gap-1">
            <Badge tone="bad">Error auditando</Badge>
            <button
              className="text-xs text-primary underline underline-offset-2"
              onClick={() => onReintentarAuditoria(negocio)}
            >
              Reintentar
            </button>
          </div>
        )}

        {estado.status === "listo" && (
          <div className="flex flex-col items-center gap-1">
            <ScoreGauge score={estado.data.score} />
            <button
              className="text-xs text-muted underline underline-offset-2"
              onClick={() => setDetalleAbierto((v) => !v)}
            >
              {detalleAbierto ? "Ocultar detalle" : "Ver detalle del score"}
            </button>
          </div>
        )}
      </div>

      <div className="flex w-full flex-col items-start gap-2 text-sm sm:w-48">
        {negocio.rating != null ? (
          <span>
            {negocio.rating.toFixed(1)}★ ({negocio.userRatingCount ?? 0}{" "}
            reseñas)
          </span>
        ) : (
          <span className="text-muted">Sin rating en Google</span>
        )}

        {mostrarGbp && (
          <>
            {estadoGbp.status === "listo" ? (
              <div className="flex flex-col gap-0.5 text-xs text-muted">
                <span>Categoría: {estadoGbp.data.categoria ?? "—"}</span>
                <span>
                  Fotos: {estadoGbp.data.fotosCount}
                  {estadoGbp.data.fotosCount === 10 ? "+" : ""}
                </span>
                <span>
                  Website en GBP: {estadoGbp.data.tieneWebsite ? "Sí" : "No"}
                </span>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="text-xs"
                onClick={() => onVerGbp(negocio)}
                disabled={estadoGbp.status === "cargando"}
              >
                {estadoGbp.status === "cargando"
                  ? "Cargando…"
                  : "Ver detalle GBP"}
              </Button>
            )}
            {estadoGbp.status === "error" && (
              <span className="text-xs text-red-600">{estadoGbp.mensaje}</span>
            )}
          </>
        )}
      </div>

      {estado.status === "listo" && detalleAbierto && (
        <div className="basis-full border-t border-border pt-3 text-xs text-muted">
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {estado.data.scoreDetalle.map((d) => (
              <li key={d.criterio} className="flex justify-between gap-2">
                <span>{d.motivo}</span>
                <span className="shrink-0 font-medium text-foreground">
                  {Math.round(d.puntos * 10) / 10}/{d.puntosMax}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
