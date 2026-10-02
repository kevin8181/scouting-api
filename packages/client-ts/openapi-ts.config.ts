import { defineConfig } from "@hey-api/openapi-ts";

// One client per API, named by its host like the spec folders. The paths are
// written out in full so knip can see the dependency on the spec package.
const specs = {
	"api.scouting.org": import.meta
		.resolve("@scouting-commons/scouting-api-spec/apis/api.scouting.org/openapi.yaml"),
	"scoutconnect-api.scouting.org": import.meta
		.resolve("@scouting-commons/scouting-api-spec/apis/scoutconnect-api.scouting.org/openapi.yaml"),
};

export default defineConfig(
	Object.entries(specs).map(([host, input]) => ({
		input,
		output: `src/generated/${host}`,
		plugins: ["@hey-api/client-fetch", "@hey-api/sdk"],
	})),
);
