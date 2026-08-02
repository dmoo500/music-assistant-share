export type MediaType = "track" | "artist" | "playlist";

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
  isrc?: string;
}

export interface SharePayload {
  /** Format version */
  v: number;
  
  /** Media type */
  type: MediaType;
  
  /** Display title (required) */
  title: string;
  
  /** Display metadata */
  artist?: string;
  album?: string;
  art?: string;
  
  /** External IDs (provider-agnostic identifiers) */
  isrc?: string;  // For tracks (International Standard Recording Code)
  mbid?: string;  // For artists (MusicBrainz ID)
  
  /** Provider quick links (optional, enriched by server) */
  links?: Record<ProviderDomain, string>;
  
  /** Playlist tracks (only for type: "playlist") */
  tracks?: PlaylistTrack[];
}
