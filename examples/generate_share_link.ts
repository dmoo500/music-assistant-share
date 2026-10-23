export type MediaType = "track" | "album" | "artist" | "playlist";

export type ProviderDomain =
  | "spotify"
  | "tidal"
  | "qobuz"
  | "ytmusic"
  | "deezer"
  | "apple_music";

export interface PlaylistTrack {
  title: string;
  artist?: string;
  album?: string;
  isrc?: string;
  mbid?: string;
  mb_track?: string;
  provider_refs?: Partial<Record<ProviderDomain, string>>;
}

export interface SharePayload {
  v: 2;
  type: MediaType;
  title: string;
  artist?: string;
  album?: string;
  isrc?: string;
  mbid?: string;
  mb_track?: string;
  barcode?: string;
  art_ref?: string;
  provider_refs?: Partial<Record<ProviderDomain, string>>;
  tracks?: PlaylistTrack[];
}

export function createShareLink(
  payload: SharePayload,
  baseUrl = "https://share.music-assistant.io",
): string {
  if (payload.v !== 2 || !payload.title.trim()) {
    throw new Error("Payload must be a complete v2 share payload");
  }

  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const encoded = btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${baseUrl}/#${encoded}`;
}

const example: SharePayload = {
  v: 2,
  type: "track",
  title: "A Better Believer",
  artist: "Volbeat",
  isrc: "DKNE11000108",
  art_ref: "m:is1-ssl:/image/thumb/...",
  provider_refs: {
    apple_music: "/de/album/1440738335?i=1440738441",
    spotify: "/track/3z8h0TU7ReDPLIbEnYhWZb",
  },
};

console.log(createShareLink(example));
