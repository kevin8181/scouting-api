# CLAUDE.md

This repo is an unofficial OpenAPI description of an API we don't control. The live API is the source of truth: the spec records what the API actually does, observed by calling it.

`openapi.yaml` is the single source of truth for API details. Keep endpoint behavior, field meanings, and quirks there, and keep the README and this file about the repo.

This is a pnpm workspace. The spec package is `packages/spec/`, and file paths below are relative to it. Run commands from the repo root. Each package declares the tools it uses as its own dev dependencies.

## Adding or changing an endpoint

1. Read `info.description` in `openapi.yaml`. It lists API-wide quirks that change how you must call the API, both when sampling and in contract tests.
2. Call the live endpoint and save real responses, including every error case (bad input, unknown ID). Sample until each field's presence and type is settled: many records, and every variant a parameter can select, such as filters and old versions.
3. Probe for undocumented query parameters. Try likely names, and read the error messages, which can name the valid parameters.
4. Trace every foreign key: a field holding another record's ID, such as `actTypeId`. Find the endpoint that lists those records, in the spec or by trying paths guessed from the field name, and confirm its IDs cover the values you sampled. Report any key you couldn't trace, and any new endpoint you found, to the user.
5. Describe it in `openapi.yaml` following the spec rules below.
6. Add a contract test in `tests/api.arazzo.yaml` for every status code you documented.
7. Done when `pnpm check` and `pnpm test` both pass.

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

Checks are meant to be strict. When one fails, fix the spec or tests to satisfy it. Loosen a rule in `redocly.yaml` only when it conflicts with real API behavior, and add a comment saying why. One-off exceptions go in `.redocly.lint-ignore.yaml`; regenerate it with `--generate-ignore-file` whenever an exception is added or resolved.

## Contract tests

`pnpm test` hits the production API. Keep each test to the fewest requests that cover its status codes: one request per documented response.

When a test fails on an operation you didn't change, call that endpoint directly before touching anything, since the API itself may be failing. If it is, report it to the user and leave the test as is.
