import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/api.scouting.org.ts", "src/scoutconnect-api.scouting.org.ts"],
	// Runs in browsers as well as Node
	platform: "neutral",
	dts: true,
	// Writes package.json exports from the entries
	exports: true,
	publint: true,
	attw: { profile: "esm-only", level: "error" },
});
