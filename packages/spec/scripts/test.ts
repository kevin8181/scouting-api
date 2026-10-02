// Runs the contract tests for every API, or for the tests files given as
// arguments. Passes SCOUTING_USERNAME and SCOUTING_PASSWORD from the
// environment as workflow inputs, for the tests that need to sign in.
import { execFileSync } from "node:child_process";
import { listApis, testsPath } from "./apis.ts";

const files =
	process.argv.length > 2
		? process.argv.slice(2)
		: (await listApis()).map(testsPath);

const inputs = {
	username: process.env["SCOUTING_USERNAME"],
	password: process.env["SCOUTING_PASSWORD"],
};

try {
	execFileSync(
		"redocly",
		["respect", ...files, "--input", JSON.stringify(inputs)],
		{ stdio: "inherit" },
	);
} catch {
	process.exit(1);
}
