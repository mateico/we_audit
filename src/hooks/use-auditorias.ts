"use client";

import { useState } from "react";
import type { NegocioBusqueda } from "@/lib/types";
import type { EstadoAuditoria, EstadoGbp } from "@/components/negocio-card";

export function useAuditorias() {
  const [auditorias, setAuditorias] = useState<Record<string, EstadoAuditoria>>(
    {},
  );
  const [gbp, setGbp] = useState<Record<string, EstadoGbp>>({});

  function inicializarEstados(negocios: NegocioBusqueda[]) {
    setAuditorias(
      Object.fromEntries(
        negocios.map((n) => [
          n.placeId,
          n.websiteUri
            ? { status: "cargando" as const }
            : { status: "sin-web" as const },
        ]),
      ),
    );
    setGbp({});
  }

  async function auditarNegocio(negocio: NegocioBusqueda) {
    setAuditorias((prev) => ({
      ...prev,
      [negocio.placeId]: { status: "cargando" },
    }));
    try {
      const res = await fetch(
        `/api/auditar?url=${encodeURIComponent(negocio.websiteUri!)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error auditando el sitio.");
      setAuditorias((prev) => ({
        ...prev,
        [negocio.placeId]: { status: "listo", data },
      }));
    } catch (err) {
      setAuditorias((prev) => ({
        ...prev,
        [negocio.placeId]: {
          status: "error",
          mensaje: err instanceof Error ? err.message : "Error desconocido",
        },
      }));
    }
  }

  async function cargarGbp(negocio: NegocioBusqueda) {
    setGbp((prev) => ({ ...prev, [negocio.placeId]: { status: "cargando" } }));
    try {
      const res = await fetch(
        `/api/detalle-negocio?placeId=${encodeURIComponent(negocio.placeId)}`,
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error ?? "Error obteniendo el detalle de GBP.");
      setGbp((prev) => ({
        ...prev,
        [negocio.placeId]: { status: "listo", data },
      }));
    } catch (err) {
      setGbp((prev) => ({
        ...prev,
        [negocio.placeId]: {
          status: "error",
          mensaje: err instanceof Error ? err.message : "Error desconocido",
        },
      }));
    }
  }

  return { auditorias, gbp, inicializarEstados, auditarNegocio, cargarGbp };
}
