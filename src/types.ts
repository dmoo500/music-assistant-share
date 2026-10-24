export type MediaType = "track" | "album" | "artist" | "playlist";

export type ProviderDomain = "spotify" | "tidal" | "qobuz" | "ytmusic" | "deezer" | "apple_music";

export interface PlaylistTrack {
  title: string;
  artist?: string;
  version?: string;
  isrc?: string;
  mbid?: string;
  mb_track?: string;
  album?: string;
  duration?: number;
  provider_refs?: Partial<Record<ProviderDomain, string>>;
}

export interface SharePayload {
  /** Media type */
  type: MediaType;

  /** Display title (required) */
  title: string;

  /** Display metadata */
  artist?: string;
  version?: string;
  album?: string;
  art_ref?: string;

  /** External IDs (provider-agnostic identifiers) */
  isrc?: string; // For tracks (International Standard Recording Code)
  mbid?: string; // For artists (MusicBrainz ID)
  mb_track?: string;
  barcode?: string;

  provider_refs?: Partial<Record<ProviderDomain, string>>;

  /** Playlist tracks (only for type: "playlist") */
  tracks?: PlaylistTrack[];
}
