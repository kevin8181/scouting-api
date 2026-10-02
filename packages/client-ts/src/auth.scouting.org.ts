import { client } from "./generated/auth.scouting.org/client.gen.js";

export * from "./generated/auth.scouting.org/index.js";
export { client };

// The API rejects requests without a version in Accept. See the quirks in the
// spec's info.description.
client.setConfig({ headers: { Accept: "application/json; version=2" } });
