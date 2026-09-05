import type { Bloque1Tecnico, PageSpeedResultado, ScoreDetalle } from "./types";

export type DatosParaScore = Omit<Bloque1Tecnico, "score" | "scoreDetalle">;

/**
 * Pesos de cada criterio (suman 100). Ajustables sin tocar la lógica de cálculo.
 * Los 3 últimos dependen de PageSpeed — si no se pudo obtener (sitio caído,
 * bloqueado por robots, etc.) esos puntos se pierden en vez de recalcular
 * el resto sobre una base más chica: un sitio sin PageSpeed disponible ya
 * tiene un problema real que vale la pena que el score refleje.
 */
const PESOS = {
  title: 8,
  metaDescription: 8,
  h1: 8,
  headingsJerarquia: 4,
  lang: 4,
  viewportMovil: 6,
  canonical: 5,
  openGraph: 6,
  favicon: 3,
  schemaLocalBusiness: 10,
  napTelefono: 6,
  napDireccion: 6,
  imagenesAlt: 6,
  performance: 12,
  lcp: 4,
  cls: 4,
} as const;

function evaluarTitle(title: string | null): ScoreDetalle {
  const max = PESOS.title;
  if (!title)
    return {
      criterio: "title",
      puntos: 0,
      puntosMax: max,
      motivo: "Falta el <title>.",
    };
  const len = title.length;
  if (len < 10 || len > 65) {
    return {
      criterio: "title",
      puntos: max * 0.5,
      puntosMax: max,
      motivo: `<title> presente pero de longitud no ideal (${len} caracteres, ideal 10-65).`,
    };
  }
  return {
    criterio: "title",
    puntos: max,
    puntosMax: max,
    motivo: "<title> presente y de longitud adecuada.",
  };
}

function evaluarMetaDescription(meta: string | null): ScoreDetalle {
  const max = PESOS.metaDescription;
  if (!meta)
    return {
      criterio: "metaDescription",
      puntos: 0,
      puntosMax: max,
      motivo: "Falta meta description.",
    };
  const len = meta.length;
  if (len < 70 || len > 160) {
    return {
      criterio: "metaDescription",
      puntos: max * 0.5,
      puntosMax: max,
      motivo: `Meta description presente pero de longitud no ideal (${len} caracteres, ideal 70-160).`,
    };
  }
  return {
    criterio: "metaDescription",
    puntos: max,
    puntosMax: max,
    motivo: "Meta description presente y de longitud adecuada.",
  };
}

function evaluarH1(h1: string[]): ScoreDetalle {
  const max = PESOS.h1;
  if (h1.length === 0)
    return { criterio: "h1", puntos: 0, puntosMax: max, motivo: "Falta H1." };
  if (h1.length > 1)
    return {
      criterio: "h1",
      puntos: max * 0.5,
      puntosMax: max,
      motivo: `Hay ${h1.length} H1 (debería haber exactamente uno).`,
    };
  return {
    criterio: "h1",
    puntos: max,
    puntosMax: max,
    motivo: "Exactamente un H1.",
  };
}

function evaluarHeadingsJerarquia(
  headingsCount: Bloque1Tecnico["headingsCount"],
): ScoreDetalle {
  const max = PESOS.headingsJerarquia;
  const tieneH2 = headingsCount.h2 > 0;
  return {
    criterio: "headingsJerarquia",
    puntos: tieneH2 ? max : 0,
    puntosMax: max,
    motivo: tieneH2
      ? "Hay estructura de subtítulos (H2)."
      : "No hay ningún H2 (contenido sin jerarquía).",
  };
}

function evaluarLang(lang: string | null): ScoreDetalle {
  const max = PESOS.lang;
  if (!lang)
    return {
      criterio: "lang",
      puntos: 0,
      puntosMax: max,
      motivo: "Falta el atributo lang en <html>.",
    };
  if (!lang.toLowerCase().startsWith("es")) {
    return {
      criterio: "lang",
      puntos: max * 0.5,
      puntosMax: max,
      motivo: `lang="${lang}" no es español — probable mismatch con el contenido real (negocio en Uruguay).`,
    };
  }
  return {
    criterio: "lang",
    puntos: max,
    puntosMax: max,
    motivo: `lang="${lang}" correcto.`,
  };
}

function evaluarViewport(viewportMovil: boolean | null): ScoreDetalle {
  const max = PESOS.viewportMovil;
  return {
    criterio: "viewportMovil",
    puntos: viewportMovil ? max : 0,
    puntosMax: max,
    motivo: viewportMovil
      ? "Meta viewport configurado para mobile."
      : "Falta meta viewport para mobile.",
  };
}

function evaluarCanonical(canonical: string | null): ScoreDetalle {
  const max = PESOS.canonical;
  return {
    criterio: "canonical",
    puntos: canonical ? max : 0,
    puntosMax: max,
    motivo: canonical ? "Tiene link canonical." : "Falta link canonical.",
  };
}

function evaluarOpenGraph(og: Record<string, string>): ScoreDetalle {
  const max = PESOS.openGraph;
  const claves = ["og:title", "og:description", "og:image"];
  const presentes = claves.filter((k) => og[k]).length;
  const puntos = (max * presentes) / claves.length;
  return {
    criterio: "openGraph",
    puntos,
    puntosMax: max,
    motivo: `${presentes}/${claves.length} tags Open Graph clave presentes (title/description/image).`,
  };
}

function evaluarFavicon(favicon: string | null): ScoreDetalle {
  const max = PESOS.favicon;
  return {
    criterio: "favicon",
    puntos: favicon ? max : 0,
    puntosMax: max,
    motivo: favicon ? "Tiene favicon." : "Falta favicon.",
  };
}

function evaluarSchemaLocalBusiness(
  schema: Bloque1Tecnico["schemaLocalBusiness"],
): ScoreDetalle {
  const max = PESOS.schemaLocalBusiness;
  return {
    criterio: "schemaLocalBusiness",
    puntos: schema ? max : 0,
    puntosMax: max,
    motivo: schema
      ? "Tiene structured data schema.org/LocalBusiness."
      : "Falta structured data schema.org/LocalBusiness (clave para SEO local).",
  };
}

function evaluarNap(
  nap: Bloque1Tecnico["napEnHtml"],
): [ScoreDetalle, ScoreDetalle] {
  const maxTel = PESOS.napTelefono;
  const maxDir = PESOS.napDireccion;
  return [
    {
      criterio: "napTelefono",
      puntos: nap.telefonoEncontrado ? maxTel : 0,
      puntosMax: maxTel,
      motivo: nap.telefonoEncontrado
        ? `Teléfono visible en el HTML (${nap.telefonoEncontrado}).`
        : "No se encontró un teléfono visible en el HTML.",
    },
    {
      criterio: "napDireccion",
      puntos: nap.direccionEncontrada ? maxDir : 0,
      puntosMax: maxDir,
      motivo: nap.direccionEncontrada
        ? "Dirección visible en el HTML."
        : "No se encontró una dirección visible en el HTML.",
    },
  ];
}

function evaluarImagenesAlt(
  imagenes: Bloque1Tecnico["imagenes"],
): ScoreDetalle {
  const max = PESOS.imagenesAlt;
  if (imagenes.total === 0) {
    return {
      criterio: "imagenesAlt",
      puntos: max,
      puntosMax: max,
      motivo: "El sitio no tiene imágenes para evaluar.",
    };
  }
  const ratioConAlt = 1 - imagenes.sinAlt / imagenes.total;
  return {
    criterio: "imagenesAlt",
    puntos: max * ratioConAlt,
    puntosMax: max,
    motivo: `${imagenes.total - imagenes.sinAlt}/${imagenes.total} imágenes con atributo alt.`,
  };
}

function evaluarPerformance(
  pagespeed: PageSpeedResultado | null,
): ScoreDetalle {
  const max = PESOS.performance;
  if (!pagespeed || pagespeed.performanceScore === null) {
    return {
      criterio: "performance",
      puntos: 0,
      puntosMax: max,
      motivo: "No se pudo obtener el score de PageSpeed.",
    };
  }
  return {
    criterio: "performance",
    puntos: (max * pagespeed.performanceScore) / 100,
    puntosMax: max,
    motivo: `Performance score de PageSpeed: ${pagespeed.performanceScore}/100.`,
  };
}

function evaluarLcp(pagespeed: PageSpeedResultado | null): ScoreDetalle {
  const max = PESOS.lcp;
  const lcp = pagespeed?.lcpMs ?? null;
  if (lcp === null)
    return {
      criterio: "lcp",
      puntos: 0,
      puntosMax: max,
      motivo: "LCP no disponible.",
    };
  if (lcp <= 2500)
    return {
      criterio: "lcp",
      puntos: max,
      puntosMax: max,
      motivo: `LCP bueno (${Math.round(lcp)}ms).`,
    };
  if (lcp <= 4000)
    return {
      criterio: "lcp",
      puntos: max * 0.5,
      puntosMax: max,
      motivo: `LCP regular (${Math.round(lcp)}ms).`,
    };
  return {
    criterio: "lcp",
    puntos: 0,
    puntosMax: max,
    motivo: `LCP malo (${Math.round(lcp)}ms, ideal <2500ms).`,
  };
}

function evaluarCls(pagespeed: PageSpeedResultado | null): ScoreDetalle {
  const max = PESOS.cls;
  const cls = pagespeed?.cls ?? null;
  if (cls === null)
    return {
      criterio: "cls",
      puntos: 0,
      puntosMax: max,
      motivo: "CLS no disponible.",
    };
  if (cls <= 0.1)
    return {
      criterio: "cls",
      puntos: max,
      puntosMax: max,
      motivo: `CLS bueno (${cls.toFixed(3)}).`,
    };
  if (cls <= 0.25)
    return {
      criterio: "cls",
      puntos: max * 0.5,
      puntosMax: max,
      motivo: `CLS regular (${cls.toFixed(3)}).`,
    };
  return {
    criterio: "cls",
    puntos: 0,
    puntosMax: max,
    motivo: `CLS malo (${cls.toFixed(3)}, ideal <0.1).`,
  };
}

export function calcularScoreTecnico(datos: DatosParaScore): {
  score: number;
  scoreDetalle: ScoreDetalle[];
} {
  const [napTelefono, napDireccion] = evaluarNap(datos.napEnHtml);

  const scoreDetalle: ScoreDetalle[] = [
    evaluarTitle(datos.title),
    evaluarMetaDescription(datos.metaDescription),
    evaluarH1(datos.h1),
    evaluarHeadingsJerarquia(datos.headingsCount),
    evaluarLang(datos.lang),
    evaluarViewport(datos.viewportMovil),
    evaluarCanonical(datos.canonical),
    evaluarOpenGraph(datos.openGraph),
    evaluarFavicon(datos.favicon),
    evaluarSchemaLocalBusiness(datos.schemaLocalBusiness),
    napTelefono,
    napDireccion,
    evaluarImagenesAlt(datos.imagenes),
    evaluarPerformance(datos.pagespeed),
    evaluarLcp(datos.pagespeed),
    evaluarCls(datos.pagespeed),
  ];

  const score = Math.round(scoreDetalle.reduce((acc, d) => acc + d.puntos, 0));

  return { score, scoreDetalle };
}
