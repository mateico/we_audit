// Tipos compartidos entre los distintos módulos de auditoría.
// Bloque 1 = técnico/on-page (scraper + PageSpeed). Bloque 2 = Google Business Profile.

export interface NegocioBusqueda {
  placeId: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  websiteUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  primaryType: string | null;
  googleMapsUri: string | null;
}

export interface SchemaLocalBusiness {
  name?: string;
  telephone?: string;
  address?: unknown;
  priceRange?: string;
  [key: string]: unknown;
}

export interface Bloque1Tecnico {
  url: string;
  title: string | null;
  metaDescription: string | null;
  h1: string[];
  headingsCount: Record<"h1" | "h2" | "h3" | "h4" | "h5" | "h6", number>;
  lang: string | null;
  viewportMovil: boolean | null;
  canonical: string | null;
  openGraph: Record<string, string>;
  favicon: string | null;
  schemaLocalBusiness: SchemaLocalBusiness | null;
  napEnHtml: {
    telefonoEncontrado: string | null;
    direccionEncontrada: boolean;
  };
  imagenes: {
    total: number;
    formatos: Record<string, number>;
    sinAlt: number;
  };
  pagespeed: PageSpeedResultado | null;
  score: number;
  scoreDetalle: ScoreDetalle[];
}

export interface PageSpeedResultado {
  lcpMs: number | null;
  cls: number | null;
  inpMs: number | null;
  performanceScore: number | null;
}

export interface ScoreDetalle {
  criterio: string;
  puntos: number;
  puntosMax: number;
  motivo: string;
}

export interface Bloque2Gbp {
  placeId: string;
  rating: number | null;
  userRatingCount: number | null;
  categoria: string | null;
  tieneWebsite: boolean;
  fotosCount: number;
}
