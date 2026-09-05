import { NextRequest, NextResponse } from "next/server";
import { getGoogleApiKey } from "@/lib/env";
import { buscarNegocios } from "@/lib/google-places";

export async function GET(req: NextRequest) {
	const rubro = req.nextUrl.searchParams.get("rubro");
	const zona = req.nextUrl.searchParams.get("zona");

	if (!rubro || !zona) {
		return NextResponse.json(
			{ error: "Faltan parámetros: rubro y zona son requeridos." },
			{ status: 400 }
		);
	}

	try {
		const apiKey = await getGoogleApiKey();
		const negocios = await buscarNegocios(apiKey, rubro, zona);
		return NextResponse.json({ negocios });
	} catch (err) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : "Error desconocido" },
			{ status: 500 }
		);
	}
}
