import type { PageSpeedResultado } from "./types";

interface PsiAudit {
  numericValue?: number;
  score?: number | null;
}

interface PsiResponse {
  lighthouseResult?: {
    categories?: { performance?: { score?: number | null } };
    audits?: Record<string, PsiAudit>;
  };
  loadingExperience?: {
    metrics?: Record<string, { percentile?: number }>;
  };
}

export async function obtenerPageSpeed(
  apiKey: string,
  url: string,
): Promise<PageSpeedResultado> {
  const endpoint = new URL(
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
  );
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("key", apiKey);
  endpoint.searchParams.set("strategy", "mobile");
  endpoint.searchParams.set("category", "performance");

  const res = await fetch(endpoint.toString());

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PageSpeed API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as PsiResponse;
  const audits = data.lighthouseResult?.audits ?? {};

  // INP de campo (CrUX) — Lighthouse en lab no mide INP real porque requiere
  // interacción de un usuario. Si el sitio no tiene tráfico suficiente, CrUX
  // no tiene datos y esto queda en null (esperable para negocios chicos).
  const inpMs =
    data.loadingExperience?.metrics?.["INTERACTION_TO_NEXT_PAINT"]
      ?.percentile ?? null;
  const performanceScoreRaw =
    data.lighthouseResult?.categories?.performance?.score;

  return {
    lcpMs: audits["largest-contentful-paint"]?.numericValue ?? null,
    cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
    inpMs,
    performanceScore:
      typeof performanceScoreRaw === "number"
        ? Math.round(performanceScoreRaw * 100)
        : null,
  };
}
