# AGENTS.md

This repo holds unofficial OpenAPI descriptions of APIs we don't control. The live APIs are the source of truth: each spec records what its API actually does, observed by calling it.

Each API's `openapi.yaml` is the single source of truth for its details. Keep endpoint behavior, field meanings, and quirks there, and keep the README and this file about the repo.

This is a pnpm workspace with two packages: the specs in `packages/spec/`, and the TypeScript client in `packages/client-ts/`. File paths below are relative to `packages/spec/` unless they start with `packages/`. Run commands from the repo root. Each package declares the tools it uses as its own dev dependencies.

Each API lives in `apis/<host>/`, named by its full host (such as `apis/api.scouting.org/`), with its spec in `openapi.yaml` and its contract tests in `tests.arazzo.yaml`.

## Adding or changing an endpoint

1. Read `info.description` in the API's `openapi.yaml`. It lists API-wide quirks that change how you must call the API, both when sampling and in contract tests.
2. Call the live endpoint and save real responses, including every error case (bad input, unknown ID). Sample until each field's presence and type is settled: many records, and every variant a parameter can select, such as filters and old versions.
3. Probe for undocumented query parameters. Try likely names, and read the error messages, which can name the valid parameters.
4. Trace every foreign key: a field holding another record's ID, such as `actTypeId`. Find the endpoint that lists those records, in any spec here or by trying paths guessed from the field name, and confirm its IDs cover the values you sampled. Report any key you couldn't trace, and any new endpoint you found, to the user.
5. Describe it in `openapi.yaml` following the spec rules below. A new API-wide quirk goes in `info.description`, and the client applies it too (see TypeScript client below).
6. Add a contract test in the API's `tests.arazzo.yaml` for every status code you documented.
7. Done when `pnpm check` and `pnpm test` both pass.

## Adding an API

1. Create `apis/<host>/openapi.yaml` and `apis/<host>/tests.arazzo.yaml`, and register both as `apis` entries in `redocly.yaml`, or they won't be linted.
2. Add the API to the client: its spec path in `specs` in `packages/client-ts/openapi-ts.config.ts`, an entry file `packages/client-ts/src/<host>.ts`, and that file in `entry` in `packages/client-ts/tsdown.config.ts`.
3. Add a row for it to the API tables in `README.md` and `packages/client-ts/README.md`.
4. Done when `pnpm check` and `pnpm build` pass, and the `exports` that `pnpm build` writes into `packages/client-ts/package.json` are committed. CI fails when they're stale.

## Spec rules

- Describe only observed behavior. When a field's meaning is unknown, leave its description out rather than guess, and tell the user.
- Write durable descriptions: the behavior a client relies on. Leave out how it was found, sample counts, server internals, and anything the name, type, or schema already says.
- Type response values exactly as the API returns them, even when that looks odd. Type inputs by how the API validates them: an ID it parses as a number is `type: integer`, and a filter it matches as text stays a string.
- List a field in `required` only if it appeared in every sampled response.
- Every object schema sets `additionalProperties: false`, so the contract tests fail when the API adds a field. Give every schema a `type`, including `anyOf` unions, because the lint rule for this treats an untyped schema as an object.
- Reuse what's in `components` (schemas, parameters, responses) before adding new ones.
- Give each traced foreign key a named ID schema in `components`, and `$ref` it from both the key and the `id` of the record it points to. When the two sides have different types, describe the link in the key's description instead.
- Document each error response with a real example captured from the API.

## Strictness

Checks are meant to be strict. When one fails, fix the spec or tests to satisfy it. Loosen a rule in `redocly.yaml` only when it conflicts with real API behavior, and add a comment saying why. Loosen it under that API's entry in `apis`, not for every API. One-off exceptions go in `.redocly.lint-ignore.yaml`; regenerate it with `--generate-ignore-file` whenever an exception is added or resolved.

## Contract tests

`pnpm test` hits the production API. Keep each test to the fewest requests that cover its status codes: one request per documented response.

When a test fails on an operation you didn't change, call that endpoint directly before touching anything, since the API itself may be failing. If it is, report it to the user and leave the test as is.

## TypeScript client

`@hey-api/openapi-ts` regenerates each API's client into `packages/client-ts/src/generated/<host>/` on every `build` and `typecheck`, so a spec change reaches the client with no client edits. The hand-written layer is one entry file per API, `packages/client-ts/src/<host>.ts`: it re-exports the generated code and `client`, and applies every API-wide quirk in that spec's `info.description`, so users of the package never need to know them.

The client stays on TypeScript 6, because `@hey-api/openapi-ts` uses the compiler API that TypeScript 7 removed.
