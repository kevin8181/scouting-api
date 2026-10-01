# scouting-api

An unofficial OpenAPI description of the Scouting America API. This project is not affiliated with or endorsed by Scouting America.

The spec lives in [`openapi.yaml`](openapi.yaml). Browse the docs at **https://kevin8181.github.io/scouting-api/**.

## Development

Requires Node.js and pnpm.

```sh
pnpm install
```

| Command          | Description                                                                        |
| ---------------- | ---------------------------------------------------------------------------------- |
| `pnpm dev`       | Serve the docs at http://localhost:8080 and rebuild on change                      |
| `pnpm build`     | Build the docs to `dist/index.html`                                                |
| `pnpm check`     | Run `format`, `lint`, `typecheck`, and `knip`. Run before committing               |
| `pnpm lint`      | Lint the spec and tests with Redocly, and check every response has a contract test |
| `pnpm format`    | Format all files with Prettier                                                     |
| `pnpm typecheck` | Type-check the scripts in `scripts/`                                               |
| `pnpm knip`      | Find unused files and dependencies with Knip                                       |
| `pnpm test`      | Run the contract tests in `tests/` against the live API                            |

CI checks formatting, lints the spec, type-checks the scripts, runs Knip, and builds the docs on every push to `main` and on pull requests.

The contract tests use [Redocly Respect](https://redocly.com/docs/respect) to send real requests and check the responses against the spec. CI runs them weekly, and on any push or pull request that changes the spec, the tests, or the tooling. Keep the number of requests small, since they hit the production API.

### Lint exceptions

Deliberate exceptions to Redocly's lint rules are listed in `.redocly.lint-ignore.yaml`. Regenerate it with:

```sh
pnpm exec redocly lint openapi.yaml --generate-ignore-file
```

## License

[CC0 1.0 Universal](LICENSE). This covers the contents of this repository only, not the API or its data.
