// Fails if any operation or documented response status in openapi.yaml has no
// contract test in tests/api.arazzo.yaml.
import { readFile } from "node:fs/promises";
import { parse } from "yaml";

const SPEC = "openapi.yaml";
const TESTS = "tests/api.arazzo.yaml";
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

const spec: Spec = parse(await readFile(SPEC, "utf8"));
const tests: Tests = parse(await readFile(TESTS, "utf8"));

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

const missing: string[] = [];
for (const [path, item] of Object.entries(spec.paths ?? {})) {
	for (const method of METHODS) {
		const operation = item[method];
		if (!operation) continue;
		const name = `${method.toUpperCase()} ${path}`;
		if (!operation.operationId) {
			missing.push(`${name}: no operationId, so it can't be tested`);
			continue;
		}
		for (const status of Object.keys(operation.responses ?? {})) {
			if (!/^\d{3}$/.test(status)) continue;
			if (!tested.has(`${operation.operationId} ${status}`)) {
				missing.push(
					`${name} (${operation.operationId}): no test for ${status}`,
				);
			}
		}
	}
}

if (missing.length) {
	console.error(`Missing contract tests in ${TESTS}:`);
	for (const line of missing) console.error(`  - ${line}`);
	process.exit(1);
}
console.log(
	`Every operation and response status in ${SPEC} has a contract test.`,
);
