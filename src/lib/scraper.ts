import * as cheerio from "cheerio";
import type { Bloque1Tecnico, SchemaLocalBusiness } from "./types";

export type ScrapeResultado = Omit<
  Bloque1Tecnico,
  "pagespeed" | "score" | "scoreDetalle"
>;

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

// Heurística simple: secuencias de dígitos con separadores típicos de telefonía
// uruguaya (fijo 4XXX XXXX, celular 09X XXX XXX). No valida el número, solo detecta.
const TELEFONO_REGEX =
  /(?:\+598[\s.-]?)?0?9\d(?:[\s.-]?\d{3}){2}|\d{4}[\s.-]?\d{4}/;

// Palabras frecuentes en direcciones uruguayas — heurística, no hay una dirección
// "esperada" contra la cual comparar en esta etapa standalone (eso vendrá después,
// cruzando contra el formattedAddress de Places).
const DIRECCION_HINTS =
  /\b(av\.?|avda\.?|avenida|ruta|bvar\.?|bulevar|calle|esquina)\b/i;

function extraerHeadings($: cheerio.CheerioAPI) {
  const h1: string[] = [];
  const headingsCount: Record<(typeof HEADING_TAGS)[number], number> = {
    h1: 0,
    h2: 0,
    h3: 0,
    h4: 0,
    h5: 0,
    h6: 0,
  };
  for (const tag of HEADING_TAGS) {
    const els = $(tag);
    headingsCount[tag] = els.length;
    if (tag === "h1") {
      els.each((_, el) => h1.push($(el).text().trim()));
    }
  }
  return { h1, headingsCount };
}

function extraerOpenGraph($: cheerio.CheerioAPI): Record<string, string> {
  const og: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const prop = $(el).attr("property");
    const content = $(el).attr("content");
    if (prop && content) og[prop] = content;
  });
  return og;
}

function resolverUrl(
  base: string,
  posibleUrl: string | undefined,
): string | null {
  if (!posibleUrl) return null;
  try {
    return new URL(posibleUrl, base).toString();
  } catch {
    return null;
  }
}

function extraerFavicon($: cheerio.CheerioAPI, url: string): string | null {
  const href =
    $('link[rel="icon"]').attr("href") ??
    $('link[rel="shortcut icon"]').attr("href") ??
    $('link[rel="apple-touch-icon"]').attr("href");
  return resolverUrl(url, href) ?? resolverUrl(url, "/favicon.ico");
}

function buscarLocalBusiness(valor: unknown): SchemaLocalBusiness | null {
  if (Array.isArray(valor)) {
    for (const item of valor) {
      const encontrado = buscarLocalBusiness(item);
      if (encontrado) return encontrado;
    }
    return null;
  }
  if (valor && typeof valor === "object") {
    const obj = valor as Record<string, unknown>;
    const tipo = obj["@type"];
    const tipos = Array.isArray(tipo) ? tipo : [tipo];
    if (
      tipos.some(
        (t) =>
          typeof t === "string" && t.toLowerCase().includes("localbusiness"),
      )
    ) {
      return obj as SchemaLocalBusiness;
    }
    if (obj["@graph"]) {
      return buscarLocalBusiness(obj["@graph"]);
    }
  }
  return null;
}

function extraerSchemaLocalBusiness(
  $: cheerio.CheerioAPI,
): SchemaLocalBusiness | null {
  let resultado: SchemaLocalBusiness | null = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (resultado) return;
    const raw = $(el).contents().text();
    try {
      const json = JSON.parse(raw);
      resultado = buscarLocalBusiness(json);
    } catch {
      // JSON-LD inválido, lo ignoramos
    }
  });
  return resultado;
}

function extraerNapEnHtml($: cheerio.CheerioAPI, bodyText: string) {
  const telefonoMatch = bodyText.match(TELEFONO_REGEX);
  const direccionEncontrada =
    DIRECCION_HINTS.test(bodyText) || $("address").length > 0;
  return {
    telefonoEncontrado: telefonoMatch?.[0]?.trim() ?? null,
    direccionEncontrada,
  };
}

function extraerImagenes($: cheerio.CheerioAPI) {
  const formatos: Record<string, number> = {};
  let sinAlt = 0;
  const imgs = $("img");
  imgs.each((_, el) => {
    const src = $(el).attr("src") ?? "";
    const match = src.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
    const ext = (match?.[1] ?? "desconocido").toLowerCase();
    formatos[ext] = (formatos[ext] ?? 0) + 1;
    if (!$(el).attr("alt")) sinAlt++;
  });
  return { total: imgs.length, formatos, sinAlt };
}

function tieneViewportMovil($: cheerio.CheerioAPI): boolean {
  const content = $('meta[name="viewport"]').attr("content") ?? "";
  return /width\s*=\s*device-width/i.test(content);
}

export async function auditarSitio(url: string): Promise<ScrapeResultado> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; WeAuditBot/0.1; +https://wekodeit.com)",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`No se pudo obtener el sitio (HTTP ${res.status}): ${url}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const bodyText = $("body").text().replace(/\s+/g, " ");

  const { h1, headingsCount } = extraerHeadings($);

  return {
    url,
    title: $("title").first().text().trim() || null,
    metaDescription:
      $('meta[name="description"]').attr("content")?.trim() ?? null,
    h1,
    headingsCount,
    lang: $("html").attr("lang") ?? null,
    viewportMovil: tieneViewportMovil($),
    canonical: resolverUrl(url, $('link[rel="canonical"]').attr("href")),
    openGraph: extraerOpenGraph($),
    favicon: extraerFavicon($, url),
    schemaLocalBusiness: extraerSchemaLocalBusiness($),
    napEnHtml: extraerNapEnHtml($, bodyText),
    imagenes: extraerImagenes($),
  };
}
