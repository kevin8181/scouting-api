# scouting-api

An unofficial OpenAPI description of the Scouting America API. This project is not affiliated with or endorsed by Scouting America.

The spec lives in [`openapi.yaml`](openapi.yaml). Browse the docs at **https://kevin8181.github.io/scouting-api/**.

## Development

Requires Node.js and pnpm.

```sh
pnpm install
```

| Command       | Description                                                               |
| ------------- | ------------------------------------------------------------------------- |
| `pnpm dev`    | Serve the docs at http://localhost:8080 and rebuild on change             |
| `pnpm build`  | Build the docs to `dist/index.html`                                       |
| `pnpm check`  | Format all files with Prettier, then lint the spec. Run before committing |
| `pnpm lint`   | Lint the spec with Redocly                                                |
| `pnpm format` | Format all files with Prettier                                            |

CI checks formatting, lints the spec, and builds the docs on every push to `main` and on pull requests.

### Lint exceptions

Deliberate exceptions to Redocly's lint rules are listed in `.redocly.lint-ignore.yaml`. Regenerate it with:

```sh
pnpm exec redocly lint openapi.yaml --generate-ignore-file
```

## License

[CC0 1.0 Universal](LICENSE). This covers the contents of this repository only, not the API or its data.
