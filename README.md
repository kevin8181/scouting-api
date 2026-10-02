<div align="center">

# scouting-api

**Unofficial OpenAPI descriptions of Scouting America APIs, checked against the live APIs every week.**

[![CI](https://github.com/scouting-commons/scouting-api/actions/workflows/ci.yml/badge.svg)](https://github.com/scouting-commons/scouting-api/actions/workflows/ci.yml)
[![Contract tests](https://github.com/scouting-commons/scouting-api/actions/workflows/contract-tests.yml/badge.svg)](https://github.com/scouting-commons/scouting-api/actions/workflows/contract-tests.yml)
[![OpenAPI 3.1](https://img.shields.io/badge/OpenAPI-3.1-6BA539?logo=openapiinitiative&logoColor=white)](https://spec.openapis.org/oas/v3.1.0)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

[**📖 Browse the docs**](https://scouting-commons.github.io/scouting-api/) · [Report an issue](https://github.com/scouting-commons/scouting-api/issues)

</div>

> [!NOTE]
> This project is not affiliated with or endorsed by Scouting America. The specs describe what the APIs actually do, observed by calling them, and may lag behind changes to the APIs.
>
> Calling these APIs is subject to Scouting America's terms of service, whether you call them through these specs or any other way.
>
> The specs grant no access beyond what Scouting America already gives you. Every endpoint is either fully public or returns only what a logged-in user can already see in Scouting America's web apps. Nothing here reveals personal information you can't already see, or lets you change anything your account can't already change. For any logged-in operations, you must supply your own credentials.

## Why

Scouting America's APIs have no public documentation. This repo fills the gap with machine-readable [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0) specs, so you can read the docs, generate a client, or import an API into your HTTP tool of choice. Every spec is strict about what it describes: each object schema rejects unknown fields, and [contract tests](#how-the-specs-stay-accurate) send real requests to confirm the spec still matches.

## APIs

| API                             | Docs                                                                                   | Spec                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `api.scouting.org`              | [Docs](https://scouting-commons.github.io/scouting-api/api.scouting.org/)              | [`openapi.yaml`](packages/spec/apis/api.scouting.org/openapi.yaml)              |
| `auth.scouting.org`             | [Docs](https://scouting-commons.github.io/scouting-api/auth.scouting.org/)             | [`openapi.yaml`](packages/spec/apis/auth.scouting.org/openapi.yaml)             |
| `scoutconnect-api.scouting.org` | [Docs](https://scouting-commons.github.io/scouting-api/scoutconnect-api.scouting.org/) | [`openapi.yaml`](packages/spec/apis/scoutconnect-api.scouting.org/openapi.yaml) |

## Quick start

Try the API right away:

```sh
curl -H 'Cache-Control: no-cache' 'https://api.scouting.org/advancements/meritBadges?id=3'
```

Before you call an API, read the `info.description` at the top of its spec. It lists the API-wide quirks that change how you need to call it, such as the `Cache-Control` header above.

### Use the TypeScript client

[`@scouting-commons/scouting-api`](packages/client-ts/) is generated from the specs and already handles each API's quirks:

```sh
npm install @scouting-commons/scouting-api
```

```ts
import { listMeritBadges } from "@scouting-commons/scouting-api/api.scouting.org";

const { data, error } = await listMeritBadges({ query: { id: "3" } });
```

See its [README](packages/client-ts/README.md) for more.

### Use a spec

Point your tooling at a spec's raw URL:

```
https://raw.githubusercontent.com/scouting-commons/scouting-api/main/packages/spec/apis/<host>/openapi.yaml
```

For example, generate a TypeScript client with [`openapi-typescript`](https://openapi-ts.dev/):

```sh
npx openapi-typescript https://raw.githubusercontent.com/scouting-commons/scouting-api/main/packages/spec/apis/api.scouting.org/openapi.yaml -o scouting.d.ts
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
| `pnpm build`     | Build every package (the docs and the client each go to their package's `dist/`)    |
| `pnpm generate`  | Regenerate the client from the specs, so your editor sees spec changes              |
| `pnpm check`     | Run `format`, `lint`, `typecheck`, and `knip`. Run before committing                |
| `pnpm lint`      | Lint the specs and tests with Redocly, and check every response has a contract test |
| `pnpm format`    | Format all files with Prettier                                                      |
| `pnpm typecheck` | Type-check every package                                                            |
| `pnpm knip`      | Find unused files and dependencies with Knip                                        |
| `pnpm test`      | Run the contract tests against the live API                                         |

> [!WARNING]
> `pnpm test` hits the production APIs. Keep the number of requests small.

CI checks formatting, lints the specs, type-checks every package, runs Knip, and builds the docs and the client on every push to `main` and on pull requests. Pushes to `main` deploy the docs to GitHub Pages.

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

packages/client-ts/
├── src/
│   ├── <host>.ts               # each API's entry point
│   └── generated/              # generated from the specs (gitignored)
├── openapi-ts.config.ts        # which specs to generate from
└── tsdown.config.ts            # builds the npm package
```

Deliberate exceptions to Redocly's lint rules are listed in `.redocly.lint-ignore.yaml`. Regenerate it with:

```sh
pnpm --filter @scouting-commons/scouting-api-spec exec redocly lint --generate-ignore-file
```

## License

[MIT](LICENSE). This covers the contents of this repository only, not the APIs or their data.
