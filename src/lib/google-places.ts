import type { NegocioBusqueda, Bloque2Gbp } from "./types";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.primaryType",
  "places.googleMapsUri",
].join(",");

interface PlacesTextSearchResponse {
  places?: Array<{
    id: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    rating?: number;
    userRatingCount?: number;
    primaryType?: string;
    googleMapsUri?: string;
  }>;
}

export async function buscarNegocios(
  apiKey: string,
  textQuery: string,
): Promise<NegocioBusqueda[]> {
  const res = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery,
        languageCode: "es",
        regionCode: "UY",
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Places API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as PlacesTextSearchResponse;

  return (data.places ?? []).map((p) => ({
    placeId: p.id,
    nombre: p.displayName?.text ?? "(sin nombre)",
    direccion: p.formattedAddress ?? null,
    telefono: p.nationalPhoneNumber ?? null,
    websiteUri: p.websiteUri ?? null,
    rating: p.rating ?? null,
    userRatingCount: p.userRatingCount ?? null,
    primaryType: p.primaryType ?? null,
    googleMapsUri: p.googleMapsUri ?? null,
  }));
}

const DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "rating",
  "userRatingCount",
  "primaryType",
  "websiteUri",
  "photos",
].join(",");

interface PlaceDetailsResponse {
  id: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  primaryType?: string;
  websiteUri?: string;
  photos?: Array<unknown>;
}

export async function obtenerDetallesGbp(
  apiKey: string,
  placeId: string,
): Promise<Bloque2Gbp> {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": DETAILS_FIELD_MASK,
      },
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Place Details API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as PlaceDetailsResponse;

  return {
    placeId: data.id,
    rating: data.rating ?? null,
    userRatingCount: data.userRatingCount ?? null,
    categoria: data.primaryType ?? null,
    tieneWebsite: Boolean(data.websiteUri),
    // Place Details (New) devuelve como máximo 10 fotos en este campo — no es
    // el total real de fotos del listado, es un límite de la API. Lo dejamos
    // documentado así para no confundirlo con "todas las fotos que tiene el GBP".
    fotosCount: data.photos?.length ?? 0,
  };
}
