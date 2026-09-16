import { NextRequest, NextResponse } from "next/server";
import { auditarSitio } from "@/lib/scraper";
import { obtenerPageSpeed } from "@/lib/pagespeed";
import { getGoogleApiKey } from "@/lib/env";
import { calcularScoreTecnico } from "@/lib/scoring";
import { aplicarLimite } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const limite = await aplicarLimite(req);
  if (limite) return limite;

  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Falta el parámetro url." },
      { status: 400 },
    );
  }

  try {
    const apiKey = await getGoogleApiKey();
    const [scrape, pagespeed] = await Promise.all([
      auditarSitio(url),
      obtenerPageSpeed(apiKey, url),
    ]);

    const datos = { ...scrape, pagespeed };
    const { score, scoreDetalle } = calcularScoreTecnico(datos);

    return NextResponse.json({ ...datos, score, scoreDetalle });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
