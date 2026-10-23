# Music Assistant Share

A stateless landing page for sharing tracks, albums, artists and playlists between Music Assistant instances.

## Development

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

The development server runs at `http://localhost:3100`.

## Flow

1. The server encodes a Music Assistant item's metadata as Base64url JSON in the URL fragment.
2. The share page displays artwork, metadata, provider links and playlist tracks.
3. The recipient opens the payload in their authenticated Music Assistant frontend.
4. Playlist import happens only after an explicit confirmation and requires library write access.

The landing page makes no unauthenticated requests to the recipient's server.

## Payload

Provider URLs are not embedded in the hash: `provider_refs` stores a relative path and query, and the client restores the HTTPS host from a fixed provider allowlist. Artwork uses a short host code plus path.

```typescript
interface SharePayload {
  type: "track" | "album" | "artist" | "playlist";
  title: string;
  artist?: string;
  album?: string;
  isrc?: string;
  mbid?: string;
  mb_track?: string;
  barcode?: string;
  art_ref?: string;
  provider_refs?: Partial<Record<ProviderDomain, string>>;
  tracks?: Array<{
    title: string;
    artist?: string;
    album?: string;
    isrc?: string;
    mbid?: string;
    mb_track?: string;
    duration?: number;
    provider_refs?: Partial<Record<ProviderDomain, string>>;
  }>;
}

type ProviderDomain = "spotify" | "tidal" | "qobuz" | "ytmusic" | "deezer" | "apple_music";
```

Example values:

```json
{
  "type": "track",
  "title": "A Better Believer",
  "artist": "Volbeat",
  "isrc": "DKNE11000108",
  "art_ref": "m:is1-ssl:/image/thumb/...",
  "provider_refs": {
    "apple_music": "/de/album/1440738335?i=1440738441",
    "spotify": "/track/3z8h0TU7ReDPLIbEnYhWZb"
  }
}
```

The short artwork form is `<host-code>[:<subdomain>]:/<path>?<query>`. Provider references are relative paths only; credentials, full URLs and unrecognized hosts are rejected. `examples/` contains Python, JavaScript and TypeScript generators.
