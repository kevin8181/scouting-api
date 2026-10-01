# CLAUDE.md

This repo is an unofficial OpenAPI description of an API we don't control. The live API is the source of truth: the spec records what the API actually does, observed by calling it.

`openapi.yaml` is the single source of truth for API details. Keep endpoint behavior, field meanings, and quirks there, and keep the README and this file about the repo.

This is a pnpm workspace. The spec package is `packages/spec/`, and file paths below are relative to it. Run commands from the repo root. Each package declares the tools it uses as its own dev dependencies; the root holds only tooling shared across packages.

## Adding or changing an endpoint

1. Call the live endpoint and save real responses, including the error cases (bad input, unknown ID). Sample widely before deciding a field is always present or always a given type: many records, varied inputs.
2. Describe it in `openapi.yaml` following the spec rules below.
3. Add a contract test in `tests/api.arazzo.yaml` for every status code you documented.
4. Done when `pnpm check` and `pnpm test` both pass.

## Spec rules

- Describe only observed behavior. When a field's meaning is unknown, leave its description out rather than guess, and tell the user.
- Every object schema has `type: object` and `additionalProperties: false`, so the contract tests fail when the API adds a field. A custom lint rule enforces this.
- List a field in `required` only if it appeared in every sampled response.
- Type values as the API returns them, even when that looks odd. Reuse the shared schemas in `components` before adding new ones.
- Every operation has an `operationId`, a `summary`, a `description`, and exactly one tag declared in `tags` (kept alphabetical). Public endpoints set `security: []`.
- Document each error response with a real example captured from the API.

## Strictness

Checks are meant to be strict. When one fails, fix the spec or tests to satisfy it. Loosen a rule in `redocly.yaml` only when it conflicts with real API behavior, and add a comment saying why.

- Lint warnings are errors (`recommended-strict` plus extra rules in `redocly.yaml`).
- `scripts/check-coverage.ts` (part of `pnpm lint`) fails if any operation or documented status code has no contract test.
- Knip fails on unused files, dependencies, and unused ignore entries.
- One-off lint exceptions go in `.redocly.lint-ignore.yaml`. Regenerate it with `--generate-ignore-file`.

## Contract tests

`pnpm test` hits the production API. Keep each test to the fewest requests that cover its status codes: one request per documented response.
