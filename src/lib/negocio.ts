import type { NegocioBusqueda } from "./types";

export function negocioDesdeUrl(url: string): NegocioBusqueda {
  return {
    placeId: `url:${url}`,
    nombre: url,
    direccion: null,
    telefono: null,
    websiteUri: url,
    rating: null,
    userRatingCount: null,
    primaryType: null,
    googleMapsUri: null,
  };
}

export function normalizarUrl(input: string): string {
  const valor = input.trim();
  if (/^https?:\/\//i.test(valor)) return valor;
  return `https://${valor}`;
}
