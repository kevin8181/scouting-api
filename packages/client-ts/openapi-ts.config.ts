import { defineConfig } from "@hey-api/openapi-ts";

// One client per API, named by its host like the spec folders
const hosts = ["api.scouting.org", "scoutconnect-api.scouting.org"];

export default defineConfig(
	hosts.map((host) => ({
		input: `../spec/apis/${host}/openapi.yaml`,
		output: `src/generated/${host}`,
		plugins: ["@hey-api/client-fetch", "@hey-api/sdk"],
	})),
);
