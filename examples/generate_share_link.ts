/**
 * Music Assistant Share Link Generator (TypeScript)
 *
 * Creates shareable links for Music Assistant media items.
 * Links encode metadata as base64url JSON in the URL fragment.
 */

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
  /** Media type */
  type: MediaType;

  /** Music Assistant URI (required) */
  uri: string;

  /** Display metadata */
  title?: string;
  artist?: string;
  album?: string;
  art?: string;

  /** Provider quick links */
  links?: Partial<Record<ProviderDomain, string>>;

  /** Playlist tracks (only for type: "playlist") */
  tracks?: PlaylistTrack[];
}

/**
 * Create a shareable link from a payload.
 *
 * @param payload - Media metadata to encode
 * @param baseUrl - Share handler base URL
 * @returns Complete shareable URL
 */
export function createShareLink(
  payload: SharePayload,
  baseUrl: string = "https://share.music-assistant.io"
): string {
  if (!payload.type || !payload.uri) {
    throw new Error("Payload must contain 'type' and 'uri' fields");
  }

  // Compact JSON (no whitespace)
  const json = JSON.stringify(payload);

  // URL-safe base64 without padding
  const encoded = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${baseUrl}/#${encoded}`;
}

export interface TrackShareOptions {
  title?: string;
  artist?: string;
  album?: string;
  art?: string;
  links?: Partial<Record<ProviderDomain, string>>;
}

/**
 * Create a shareable link for a track.
 */
export function createTrackShareLink(
  uri: string,
  options?: TrackShareOptions
): string {
  return createShareLink({ type: "track", uri, ...options });
}

export interface AlbumShareOptions {
  title?: string;
  artist?: string;
  art?: string;
  links?: Partial<Record<ProviderDomain, string>>;
}

/**
 * Create a shareable link for an album.
 */
export function createAlbumShareLink(
  uri: string,
  options?: AlbumShareOptions
): string {
  return createShareLink({ type: "album", uri, ...options });
}

export interface ArtistShareOptions {
  title?: string;
  art?: string;
  links?: Partial<Record<ProviderDomain, string>>;
}

/**
 * Create a shareable link for an artist.
 */
export function createArtistShareLink(
  uri: string,
  options?: ArtistShareOptions
): string {
  return createShareLink({ type: "artist", uri, ...options });
}

export interface PlaylistShareOptions {
  title?: string;
  art?: string;
  tracks?: PlaylistTrack[];
  links?: Partial<Record<ProviderDomain, string>>;
}

/**
 * Create a shareable link for a playlist.
 */
export function createPlaylistShareLink(
  uri: string,
  options?: PlaylistShareOptions
): string {
  return createShareLink({ type: "playlist", uri, ...options });
}

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const trackLink = createTrackShareLink("library://track/123", {
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    art: "https://example.com/art.jpg",
    links: {
      spotify: "https://open.spotify.com/track/3z8h0TU7ReDPLIbEnYhWZb",
      tidal: "https://tidal.com/browse/track/5250269",
    },
  });
  console.log("Track:", trackLink);

  const albumLink = createAlbumShareLink("spotify://album/6i6folBtxKV28WX3msQ4FE", {
    title: "A Night at the Opera",
    artist: "Queen",
  });
  console.log("Album:", albumLink);

  const playlistLink = createPlaylistShareLink("library://playlist/456", {
    title: "My Favorites",
    tracks: [
      { title: "Bohemian Rhapsody", artist: "Queen" },
      { title: "Stairway to Heaven", artist: "Led Zeppelin" },
    ],
  });
  console.log("Playlist:", playlistLink);
}
