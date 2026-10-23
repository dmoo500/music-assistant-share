const SHARE_BASE_URL = "https://share.music-assistant.io";

function encodePayload(payload) {
  if (!payload.type || !payload.title) {
    throw new Error("Payload must include a media type and title");
  }

  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function createShareLink(payload, baseUrl = SHARE_BASE_URL) {
  return `${baseUrl}/#${encodePayload(payload)}`;
}

const trackLink = createShareLink({
  type: "track",
  title: "A Better Believer",
  artist: "Volbeat",
  isrc: "DKNE11000108",
  art_ref: "m:is1-ssl:/image/thumb/...",
  provider_refs: {
    apple_music: "/de/album/1440738335?i=1440738441",
    spotify: "/track/3z8h0TU7ReDPLIbEnYhWZb",
  },
});

console.log(trackLink);
