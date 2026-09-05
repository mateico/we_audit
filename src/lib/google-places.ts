import type { NegocioBusqueda } from "./types";

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
	rubro: string,
	zona: string
): Promise<NegocioBusqueda[]> {
	const textQuery = `${rubro} en ${zona}`;

	const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
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
	});

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
