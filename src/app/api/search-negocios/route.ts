import { NextRequest, NextResponse } from "next/server";
import { getGoogleApiKey } from "@/lib/env";
import { buscarNegocios } from "@/lib/google-places";
import { aplicarLimite } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const limite = await aplicarLimite(req);
  if (limite) return limite;

  const rubro = req.nextUrl.searchParams.get("rubro");
  const zona = req.nextUrl.searchParams.get("zona");

  if (!rubro || !zona) {
    return NextResponse.json(
      { error: "Faltan parámetros: rubro y zona son requeridos." },
      { status: 400 },
    );
  }

  try {
    const apiKey = await getGoogleApiKey();
    const textQuery = `${rubro} en ${zona}`;
    const negocios = await buscarNegocios(apiKey, textQuery);
    return NextResponse.json({ negocios });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
