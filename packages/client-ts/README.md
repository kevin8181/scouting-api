# @scouting-commons/scouting-api

**Unofficial TypeScript client for Scouting America APIs, generated from the [scouting-api](https://github.com/scouting-commons/scouting-api) specs.**

> [!NOTE]
> This project is not affiliated with or endorsed by Scouting America. The client is generated from specs that describe what the APIs actually do, observed by calling them, and may lag behind changes to the APIs.

## Install

```sh
npm install @scouting-commons/scouting-api
```

## Usage

Each API has its own import path, named by its host. Every operation is a function that returns the parsed response as `data`, or the API's error response as `error`:

```ts
import { listMeritBadges } from "@scouting-commons/scouting-api/api.scouting.org";

const { data, error } = await listMeritBadges({ query: { id: "3" } });
if (error) throw new Error(error.message);

console.log(data.meritBadges[0]?.name);
```

Each import path also exports that API's `client`, for changing settings such as headers or the base URL:

```ts
import { client } from "@scouting-commons/scouting-api/api.scouting.org";

client.setConfig({ baseUrl: "https://example.com" });
```

The client already handles the API-wide quirks listed in each spec's `info.description`, so you don't need to.

## APIs

| API                             | Docs                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| `api.scouting.org`              | [Docs](https://scouting-commons.github.io/scouting-api/api.scouting.org/)              |
| `scoutconnect-api.scouting.org` | [Docs](https://scouting-commons.github.io/scouting-api/scoutconnect-api.scouting.org/) |

## Contributing

The client is generated from the specs, so a wrong field or missing endpoint is fixed in the spec. Issues and pull requests are welcome in the [scouting-api repo](https://github.com/scouting-commons/scouting-api).

## License

[MIT](LICENSE)
