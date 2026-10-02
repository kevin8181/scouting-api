// Each API lives in its own folder under apis/, named by its host, with an
// openapi.yaml and contract tests in tests.arazzo.yaml.
import { execFile } from "node:child_process";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { parse } from "yaml";

export const APIS_DIR = "apis";
export const OUT_DIR = "dist";

export const specPath = (host: string) => `${APIS_DIR}/${host}/openapi.yaml`;
export const testsPath = (host: string) =>
	`${APIS_DIR}/${host}/tests.arazzo.yaml`;

export async function listApis(): Promise<string[]> {
	const entries = await readdir(APIS_DIR, { withFileTypes: true });
	return entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();
}

function buildDocs(host: string): Promise<void> {
	return new Promise((resolve, reject) => {
		execFile(
			"redocly",
			["build-docs", specPath(host), "-o", `${OUT_DIR}/${host}/index.html`],
			(error, _stdout, stderr) => {
				if (error) reject(new Error(stderr || error.message));
				else resolve();
			},
		);
	});
}

// Builds the docs for every API, plus an index page linking to each.
export async function buildAll(): Promise<void> {
	const hosts = await listApis();
	await Promise.all(hosts.map(buildDocs));

	const links = await Promise.all(
		hosts.map(async (host) => {
			const spec = parse(await readFile(specPath(host), "utf8"));
			return `<li><a href="${host}/">${spec.info.title}</a> (${host})</li>`;
		}),
	);
	await mkdir(OUT_DIR, { recursive: true });
	await writeFile(
		`${OUT_DIR}/index.html`,
		`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Scouting America APIs</title></head>
<body>
<h1>Scouting America APIs</h1>
<p>Unofficial, community-maintained descriptions. Not affiliated with or endorsed by Scouting America.</p>
<ul>
${links.join("\n")}
</ul>
</body>
</html>
`,
	);
}
