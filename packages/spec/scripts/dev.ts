// Serves the built docs and rebuilds them whenever a file under apis/ changes.
// Open pages reload themselves after each rebuild.
import { readFile, watch } from "node:fs/promises";
import { createServer, type ServerResponse } from "node:http";
import { APIS_DIR, buildAll, listApis, OUT_DIR } from "./apis.ts";

const PORT = Number(process.env["PORT"] ?? 8080);
const RELOAD_SCRIPT = `<script>new EventSource("/__reload").onmessage = () => location.reload();</script>`;

const clients = new Set<ServerResponse>();

async function build(): Promise<boolean> {
	try {
		await buildAll();
		console.log(`Rebuilt ${OUT_DIR}/`);
		return true;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		return false;
	}
}

// Maps "/" to the index page and "/<host>/" to that API's docs.
async function pageFor(url: string): Promise<string | undefined> {
	const match = url.match(/^\/(?:([^/]+)\/)?(?:index\.html)?$/);
	if (!match) return undefined;
	const host = match[1];
	if (host === undefined) return `${OUT_DIR}/index.html`;
	if ((await listApis()).includes(host)) return `${OUT_DIR}/${host}/index.html`;
	return undefined;
}

const server = createServer(async (req, res) => {
	if (req.url === "/__reload") {
		res.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
		});
		clients.add(res);
		req.on("close", () => clients.delete(res));
		return;
	}
	const page = await pageFor(req.url ?? "/");
	if (!page) {
		res.writeHead(404).end();
		return;
	}
	try {
		const html = await readFile(page, "utf8");
		res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
		res.end(html.replace("</body>", `${RELOAD_SCRIPT}</body>`));
	} catch {
		res.writeHead(500).end(`Could not read ${page}`);
	}
});

await build();
server.listen(PORT, () => console.log(`Docs at http://localhost:${PORT}`));

// Editors often emit several events per save, so debounce rebuilds.
let timer: NodeJS.Timeout | undefined;
for await (const _ of watch(APIS_DIR, { recursive: true })) {
	clearTimeout(timer);
	timer = setTimeout(async () => {
		if (await build())
			for (const client of clients) client.write("data: reload\n\n");
	}, 100);
}
