// Serves the built docs and rebuilds them whenever openapi.yaml changes.
// Open pages reload themselves after each rebuild.
import { execFile } from "node:child_process";
import { readFile, watch } from "node:fs/promises";
import { createServer } from "node:http";

const SPEC = "openapi.yaml";
const OUT = "dist/index.html";
const PORT = Number(process.env.PORT ?? 8080);
const RELOAD_SCRIPT = `<script>new EventSource("/__reload").onmessage = () => location.reload();</script>`;

const clients = new Set();

function build() {
	return new Promise((resolve) => {
		execFile(
			"redocly",
			["build-docs", SPEC, "-o", OUT],
			(error, stdout, stderr) => {
				if (error) console.error(stderr || error.message);
				else console.log(`Rebuilt ${OUT}`);
				resolve(!error);
			},
		);
	});
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
	if (req.url !== "/" && req.url !== "/index.html") {
		res.writeHead(404).end();
		return;
	}
	try {
		const html = await readFile(OUT, "utf8");
		res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
		res.end(html.replace("</body>", `${RELOAD_SCRIPT}</body>`));
	} catch {
		res.writeHead(500).end(`Could not read ${OUT}`);
	}
});

await build();
server.listen(PORT, () => console.log(`Docs at http://localhost:${PORT}`));

// Editors often emit several events per save, so debounce rebuilds.
let timer;
for await (const _ of watch(SPEC)) {
	clearTimeout(timer);
	timer = setTimeout(async () => {
		if (await build())
			for (const client of clients) client.write("data: reload\n\n");
	}, 100);
}
