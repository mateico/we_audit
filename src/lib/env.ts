import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getGoogleApiKey(): Promise<string> {
	const { env } = await getCloudflareContext({ async: true });
	const key = (env as unknown as Record<string, string | undefined>).GOOGLE_API_KEY;
	if (!key) {
		throw new Error(
			"Falta GOOGLE_API_KEY. Definila en .dev.vars (ver .dev.vars.example)."
		);
	}
	return key;
}
