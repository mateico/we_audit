import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

export async function aplicarLimite(
  req: NextRequest,
): Promise<NextResponse | null> {
  const { env } = await getCloudflareContext({ async: true });
  const ip = req.headers.get("cf-connecting-ip") ?? "desconocido";
  const { success } = await env.RATE_LIMITER.limit({ key: ip });

  if (!success) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Probá de nuevo en un minuto." },
      { status: 429 },
    );
  }

  return null;
}
