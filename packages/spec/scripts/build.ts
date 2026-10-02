// Builds the docs for every API into dist/.
import { buildAll, OUT_DIR } from "./apis.ts";

await buildAll();
console.log(`Built docs into ${OUT_DIR}/`);
