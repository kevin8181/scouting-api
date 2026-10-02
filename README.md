<div align="center">

# scouting-api

**Unofficial OpenAPI descriptions of Scouting America APIs, checked against the live APIs every week.**

[![CI](https://github.com/kevin8181/scouting-api/actions/workflows/ci.yml/badge.svg)](https://github.com/kevin8181/scouting-api/actions/workflows/ci.yml)
[![Contract tests](https://github.com/kevin8181/scouting-api/actions/workflows/contract-tests.yml/badge.svg)](https://github.com/kevin8181/scouting-api/actions/workflows/contract-tests.yml)
[![OpenAPI 3.1](https://img.shields.io/badge/OpenAPI-3.1-6BA539?logo=openapiinitiative&logoColor=white)](https://spec.openapis.org/oas/v3.1.0)
[![License: CC0-1.0](https://img.shields.io/badge/license-CC0--1.0-lightgrey)](LICENSE)

[**📖 Browse the docs**](https://kevin8181.github.io/scouting-api/) · [Report an issue](https://github.com/kevin8181/scouting-api/issues)

</div>

> [!NOTE]
> This project is not affiliated with or endorsed by Scouting America. The specs describe what the APIs actually do, observed by calling them, and may lag behind changes to the APIs.

## Why

Scouting America's APIs have no public documentation. This repo fills the gap with machine-readable [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0) specs, so you can read the docs, generate a client, or import an API into your HTTP tool of choice. Every spec is strict about what it describes: each object schema rejects unknown fields, and [contract tests](#how-the-specs-stay-accurate) send real requests to confirm the spec still matches.

## APIs

| API                             | Docs                                                                            | Spec                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `api.scouting.org`              | [Docs](https://kevin8181.github.io/scouting-api/api.scouting.org/)              | [`openapi.yaml`](packages/spec/apis/api.scouting.org/openapi.yaml)              |
| `scoutconnect-api.scouting.org` | [Docs](https://kevin8181.github.io/scouting-api/scoutconnect-api.scouting.org/) | [`openapi.yaml`](packages/spec/apis/scoutconnect-api.scouting.org/openapi.yaml) |

## Quick start

Try the API right away:

```sh
curl -H 'Cache-Control: no-cache' 'https://api.scouting.org/advancements/meritBadges?id=3'
```

Before you call an API, read the `info.description` at the top of its spec. It lists the API-wide quirks that change how you need to call it, such as the `Cache-Control` header above.

### Use a spec

Point your tooling at a spec's raw URL:

```
https://raw.githubusercontent.com/kevin8181/scouting-api/main/packages/spec/apis/<host>/openapi.yaml
```

For example, generate a TypeScript client with [`openapi-typescript`](https://openapi-ts.dev/):

```sh
npx openapi-typescript https://raw.githubusercontent.com/kevin8181/scouting-api/main/packages/spec/apis/api.scouting.org/openapi.yaml -o scouting.d.ts
```

The same URL works for importing into Postman, Insomnia, Bruno, or any OpenAPI code generator.

## How the specs stay accurate

- **Observed, not guessed.** Each field, parameter, and error response comes from real responses. A field whose meaning is unknown gets no description rather than a guess.
- **Closed schemas.** Every object schema sets `additionalProperties: false`, so a field the API adds shows up as a test failure.
- **Contract tests.** [Redocly Respect](https://redocly.com/docs/respect) sends real requests and checks every documented status code against the spec. CI runs them every Monday, and on any change to a spec, the tests, or the tooling, with a separate job for each API.
- **Strict linting.** Redocly's `recommended-strict` ruleset plus extra rules, and a coverage check that every documented response has a contract test.

## Contributing

Issues and pull requests are welcome, whether it's a missing endpoint, a field that's wrong, or a quirk worth noting. The full workflow for adding an endpoint, and the rules every spec follows, are in [`CLAUDE.md`](CLAUDE.md). It's written for AI coding agents, and it reads fine for humans too.

### Setup

Requires Node.js 24+ and pnpm. Run commands from the repository root.

```sh
pnpm install
pnpm dev      # serve the docs at http://localhost:8080
```

| Command          | Description                                                                         |
| ---------------- | ----------------------------------------------------------------------------------- |
| `pnpm dev`       | Serve the docs at http://localhost:8080 and rebuild on change                       |
| `pnpm build`     | Build every package (the docs go to `packages/spec/dist/`)                          |
| `pnpm check`     | Run `format`, `lint`, `typecheck`, and `knip`. Run before committing                |
| `pnpm lint`      | Lint the specs and tests with Redocly, and check every response has a contract test |
| `pnpm format`    | Format all files with Prettier                                                      |
| `pnpm typecheck` | Type-check every package                                                            |
| `pnpm knip`      | Find unused files and dependencies with Knip                                        |
| `pnpm test`      | Run the contract tests against the live API                                         |

> [!WARNING]
> `pnpm test` hits the production APIs. Keep the number of requests small.

CI checks formatting, lints the specs, type-checks the scripts, runs Knip, and builds the docs on every push to `main` and on pull requests. Pushes to `main` deploy the docs to GitHub Pages.

### Layout

This is a pnpm workspace. Each package lives in `packages/` and owns its own dependencies and scripts. The root holds shared tooling (Prettier, Knip, TypeScript settings, CI), and root scripts run across every package.

```
packages/spec/
├── apis/
│   └── <host>/
│       ├── openapi.yaml        # the spec
│       └── tests.arazzo.yaml   # its contract tests
├── scripts/                    # docs build, dev server, coverage check
├── redocly.yaml                # lint rules and the list of APIs
└── .redocly.lint-ignore.yaml   # deliberate lint exceptions
```

Deliberate exceptions to Redocly's lint rules are listed in `.redocly.lint-ignore.yaml`. Regenerate it with:

```sh
pnpm --filter @scouting-api/spec exec redocly lint --generate-ignore-file
```

## License

[CC0 1.0 Universal](LICENSE). This covers the contents of this repository only, not the APIs or their data.
