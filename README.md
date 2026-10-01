# scouting-api

An unofficial OpenAPI description of the Scouting America API. This project is not affiliated with or endorsed by Scouting America.

The spec lives in [`packages/spec/openapi.yaml`](packages/spec/openapi.yaml). Browse the docs at **https://kevin8181.github.io/scouting-api/**.

## Layout

This is a pnpm workspace. Each package lives in `packages/` and owns its own dependencies and scripts. The root holds shared tooling (Prettier, Knip, TypeScript settings, CI), and root scripts run across every package.

| Package                          | Contents                                     |
| -------------------------------- | -------------------------------------------- |
| [`packages/spec`](packages/spec) | The OpenAPI spec, docs build, contract tests |

## Development

Requires Node.js and pnpm. Run commands from the repository root.

```sh
pnpm install
```

| Command          | Description                                                                        |
| ---------------- | ---------------------------------------------------------------------------------- |
| `pnpm dev`       | Serve the docs at http://localhost:8080 and rebuild on change                      |
| `pnpm build`     | Build every package (the docs go to `packages/spec/dist/`)                         |
| `pnpm check`     | Run `format`, `lint`, `typecheck`, and `knip`. Run before committing               |
| `pnpm lint`      | Lint the spec and tests with Redocly, and check every response has a contract test |
| `pnpm format`    | Format all files with Prettier                                                     |
| `pnpm typecheck` | Type-check every package                                                           |
| `pnpm knip`      | Find unused files and dependencies with Knip                                       |
| `pnpm test`      | Run the contract tests against the live API                                        |

CI checks formatting, lints the spec, type-checks the scripts, runs Knip, and builds the docs on every push to `main` and on pull requests.

The contract tests use [Redocly Respect](https://redocly.com/docs/respect) to send real requests and check the responses against the spec. CI runs them weekly, and on any push or pull request that changes the spec, the tests, or the tooling. Keep the number of requests small, since they hit the production API.

### Lint exceptions

Deliberate exceptions to Redocly's lint rules are listed in `packages/spec/.redocly.lint-ignore.yaml`. Regenerate it with:

```sh
pnpm --filter @scouting-api/spec exec redocly lint openapi.yaml --generate-ignore-file
```

## License

[CC0 1.0 Universal](LICENSE). This covers the contents of this repository only, not the API or its data.
