// For every API under apis/, fails if any operation or documented response
// status in its openapi.yaml has no contract test in its tests.arazzo.yaml, or
// if either file isn't registered in redocly.yaml, which would leave it unlinted.
import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import { listApis, specPath, testsPath } from "./apis.ts";

const METHODS = [
	"get",
	"put",
	"post",
	"delete",
	"options",
	"head",
	"patch",
	"trace",
] as const;

// Only the parts of each document this script reads
type Operation = { operationId?: string; responses?: Record<string, unknown> };
type Spec = {
	paths?: Record<string, Partial<Record<(typeof METHODS)[number], Operation>>>;
};
type Step = {
	operationId?: string;
	successCriteria?: { condition: string }[];
};
type Tests = { workflows?: { steps?: Step[] }[] };
type Config = { apis?: Record<string, { root: string }> };

const config: Config = parse(await readFile("redocly.yaml", "utf8"));
const registered = new Set(
	Object.values(config.apis ?? {}).map((api) => api.root),
);

let failed = false;
for (const host of await listApis()) {
	const specFile = specPath(host);
	const testsFile = testsPath(host);
	const problems: string[] = [];

	for (const file of [specFile, testsFile]) {
		if (!registered.has(file)) {
			problems.push(`${file} is not an \`apis\` root in redocly.yaml`);
		}
	}

	const spec: Spec = parse(await readFile(specFile, "utf8"));
	const tests: Tests = parse(await readFile(testsFile, "utf8"));

	const tested = new Set<string>();
	for (const workflow of tests.workflows ?? []) {
		for (const step of workflow.steps ?? []) {
			const operationId = step.operationId?.split(".").at(-1);
			for (const { condition } of step.successCriteria ?? []) {
				const status = condition.match(/\$statusCode\s*==\s*(\d{3})/)?.[1];
				if (operationId && status) tested.add(`${operationId} ${status}`);
			}
		}
	}

	for (const [path, item] of Object.entries(spec.paths ?? {})) {
		for (const method of METHODS) {
			const operation = item[method];
			if (!operation) continue;
			const name = `${method.toUpperCase()} ${path}`;
			if (!operation.operationId) {
				problems.push(`${name}: no operationId, so it can't be tested`);
				continue;
			}
			for (const status of Object.keys(operation.responses ?? {})) {
				if (!/^\d{3}$/.test(status)) continue;
				if (!tested.has(`${operation.operationId} ${status}`)) {
					problems.push(
						`${name} (${operation.operationId}): no test for ${status}`,
					);
				}
			}
		}
	}

	if (problems.length) {
		failed = true;
		console.error(`${host}:`);
		for (const line of problems) console.error(`  - ${line}`);
	} else {
		console.log(
			`${host}: every operation and response status has a contract test.`,
		);
	}
}
if (failed) process.exit(1);
