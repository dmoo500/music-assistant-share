export type MediaType = "track" | "album" | "artist" | "playlist";

export type ProviderDomain =
  | "spotify"
  | "tidal"
  | "qobuz"
  | "ytmusic"
  | "deezer"
  | "apple_music";

export interface PlaylistTrack {
  title?: string;
  artist?: string;
}

export interface SharePayload {
  type: MediaType;
  title?: string;
  artist?: string;
  album?: string;
  art?: string;
  uri: string;
  links?: Record<ProviderDomain, string>;
  tracks?: PlaylistTrack[];
}
