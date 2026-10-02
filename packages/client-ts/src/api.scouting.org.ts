import { client } from "./generated/api.scouting.org/client.gen.js";

export * from "./generated/api.scouting.org/index.js";
export { client };

// Some list endpoints ignore query filters without this header. See the
// quirks in the spec's info.description.
client.setConfig({ headers: { "Cache-Control": "no-cache" } });
