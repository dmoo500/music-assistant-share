/**
 * Music Assistant Share Link Generator (JavaScript/TypeScript)
 *
 * Creates shareable links for Music Assistant media items.
 * Links encode metadata as base64url JSON in the URL fragment.
 */

/**
 * @typedef {"track" | "album" | "artist" | "playlist"} MediaType
 */

/**
 * @typedef {Object} PlaylistTrack
 * @property {string} [title] - Track title
 * @property {string} [artist] - Artist name
 */

/**
 * @typedef {Object} SharePayload
 * @property {MediaType} type - Media type
 * @property {string} uri - MA URI (provider://mediatype/id)
 * @property {string} [title] - Display title
 * @property {string} [artist] - Artist name
 * @property {string} [album] - Album name
 * @property {string} [art] - Album art URL
 * @property {Object.<string, string>} [links] - Provider quick links
 * @property {PlaylistTrack[]} [tracks] - Playlist tracks
 */

/**
 * Create a shareable link from a payload.
 *
 * @param {SharePayload} payload - Media metadata to encode
 * @param {string} [baseUrl="https://share.music-assistant.io"] - Share handler base URL
 * @returns {string} Complete shareable URL
 */
function createShareLink(payload, baseUrl = "https://share.music-assistant.io") {
  if (!payload.type || !payload.uri) {
    throw new Error("Payload must contain 'type' and 'uri' fields");
  }

  // Compact JSON (no whitespace)
  const json = JSON.stringify(payload);

  // URL-safe base64 without padding
  // Note: btoa() doesn't handle UTF-8 correctly, so we encode first
  const encoded = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${baseUrl}/#${encoded}`;
}

/**
 * Create a shareable link for a track.
 *
 * @param {string} uri - MA URI (e.g., "library://track/123")
 * @param {Object} [options] - Optional metadata
 * @param {string} [options.title] - Track title
 * @param {string} [options.artist] - Artist name
 * @param {string} [options.album] - Album name
 * @param {string} [options.art] - Album art URL
 * @param {Object.<string, string>} [options.links] - Provider quick links
 * @returns {string} Shareable URL
 */
function createTrackShareLink(uri, options = {}) {
  const payload = { type: "track", uri, ...options };
  return createShareLink(payload);
}

/**
 * Create a shareable link for an album.
 */
function createAlbumShareLink(uri, options = {}) {
  const payload = { type: "album", uri, ...options };
  return createShareLink(payload);
}

/**
 * Create a shareable link for an artist.
 */
function createArtistShareLink(uri, options = {}) {
  const payload = { type: "artist", uri, ...options };
  return createShareLink(payload);
}

/**
 * Create a shareable link for a playlist.
 */
function createPlaylistShareLink(uri, options = {}) {
  const payload = { type: "playlist", uri, ...options };
  return createShareLink(payload);
}

// Example usage (Browser/Node.js)
if (typeof window === "undefined") {
  // Node.js examples
  console.log("Track:", createTrackShareLink("library://track/123", {
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    art: "https://example.com/art.jpg",
    links: {
      spotify: "https://open.spotify.com/track/3z8h0TU7ReDPLIbEnYhWZb",
      tidal: "https://tidal.com/browse/track/5250269"
    }
  }));

  console.log("Album:", createAlbumShareLink("spotify://album/6i6folBtxKV28WX3msQ4FE", {
    title: "A Night at the Opera",
    artist: "Queen"
  }));

  console.log("Playlist:", createPlaylistShareLink("library://playlist/456", {
    title: "My Favorites",
    tracks: [
      { title: "Bohemian Rhapsody", artist: "Queen" },
      { title: "Stairway to Heaven", artist: "Led Zeppelin" }
    ]
  }));
}

// ES Module export
export {
  createShareLink,
  createTrackShareLink,
  createAlbumShareLink,
  createArtistShareLink,
  createPlaylistShareLink
};
