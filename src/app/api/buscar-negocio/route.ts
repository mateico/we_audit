import { NextRequest, NextResponse } from "next/server";
import { getGoogleApiKey } from "@/lib/env";
import { buscarNegocios } from "@/lib/google-places";
import { aplicarLimite } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const limite = await aplicarLimite(req);
  if (limite) return limite;

  const nombre = req.nextUrl.searchParams.get("nombre");
  const ciudad = req.nextUrl.searchParams.get("ciudad");
  const direccion = req.nextUrl.searchParams.get("direccion");

  if (!nombre || !ciudad) {
    return NextResponse.json(
      { error: "Faltan parámetros: nombre y ciudad son requeridos." },
      { status: 400 },
    );
  }

  try {
    const apiKey = await getGoogleApiKey();
    const textQuery = direccion
      ? `${nombre}, ${direccion}, ${ciudad}`
      : `${nombre} en ${ciudad}`;
    const negocios = await buscarNegocios(apiKey, textQuery);
    return NextResponse.json({ negocios });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
