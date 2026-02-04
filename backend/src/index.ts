import {CaseController} from "./controller";

type RouteHandler = (req: Request, params: RegExpMatchArray | null) => Promise<Response> | Response;

const routes: { method: string; pattern: RegExp; handler: RouteHandler }[] = [
	{method: "POST", pattern: /^\/api\/cases$/, handler: (req) => CaseController.create(req)},
	{method: "GET", pattern: /^\/api\/cases$/, handler: () => CaseController.listCases()},
	{
		method: "GET", pattern: /^\/api\/cases\/([^\/]+)$/, handler: (_req, m) => {
			const id = m?.[1];
			if (!id) return new Response("Bad Request, missing case ID", {status: 400});
			return CaseController.getHistory(id);
		}
	},
	{
		method: "GET", pattern: /^\/api\/cases\/([^\/]+)\/coreinfos$/, handler: (_req, m) => {
			const id = m?.[1];
			if (!id) return new Response("Bad Request, missing case ID", {status: 400});
			return CaseController.getAllCoreInfos(id);
		}
	},
	{method: "POST", pattern: /^\/api\/chat$/, handler: (req) => CaseController.chat(req)},
	{
		method: "GET",
		pattern: /^\/api\/tts$/,
		handler: (req) => CaseController.streamTTS(req)
	},
];

function findRoute(pathname: string, method: string) {
	for (const r of routes) {
		if (r.method === method) {
			const match = pathname.match(r.pattern);
			if (match) return {route: r, match};
		}
	}
	return null;
}

function applyDefaultHeaders(res: Response) {
	const headers = new Headers(res.headers);
	if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json; charset=utf-8");
	headers.set("Access-Control-Allow-Origin", "*");
	headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
	headers.set("Access-Control-Allow-Headers", "Content-Type");
	return new Response(res.body, {status: res.status, headers});
}

const server = Bun.serve({
	port: 3000,
	idleTimeout: 60 * 3,
	async fetch(req) {
		try {
			const url = new URL(req.url);
			const pathname = url.pathname;
			// Preflight
			if (req.method === "OPTIONS") {
				return new Response(null, {
					status: 204,
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
						"Access-Control-Allow-Headers": "Content-Type",
					},
				});
			}
			
			const found = findRoute(pathname, req.method);
			if (!found) return new Response("Not Found", {status: 404});
			
			console.log(`${req.method} ${pathname}`);
			
			const resp = await found.route.handler(req, found.match);
			return applyDefaultHeaders(resp instanceof Response ? resp : new Response(String(resp)));
		} catch (err) {
			console.error("Server error:", err);
			return new Response(JSON.stringify({error: "Internal Server Error"}), {
				status: 500,
				headers: {"Content-Type": "application/json; charset=utf-8"}
			});
		}
	},
});

console.log(`🕵️‍♂️ Detective Backend läuft auf Port ${server.port}`);