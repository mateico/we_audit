import { NextRequest, NextResponse } from "next/server";
import { getGoogleApiKey } from "@/lib/env";
import { obtenerDetallesGbp } from "@/lib/google-places";
import { aplicarLimite } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const limite = await aplicarLimite(req);
  if (limite) return limite;

  const placeId = req.nextUrl.searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json(
      { error: "Falta el parámetro placeId." },
      { status: 400 },
    );
  }

  try {
    const apiKey = await getGoogleApiKey();
    const detalles = await obtenerDetallesGbp(apiKey, placeId);
    return NextResponse.json(detalles);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
