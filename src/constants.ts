import type { ProviderDomain } from "./types";

export const STORAGE_KEY = "ma_instance_url";

export const COMMON_URLS = [
  "http://homeassistant.local:8095",
  "http://localhost:8095",
  "http://musicassistant.local:8095",
];

export const PROVIDER_LABELS: Record<ProviderDomain, string> = {
  spotify: "Spotify",
  tidal: "Tidal",
  qobuz: "Qobuz",
  ytmusic: "YouTube Music",
  deezer: "Deezer",
  apple_music: "Apple Music",
};

export const PROVIDER_COLORS: Record<ProviderDomain, string> = {
  spotify: "#1ED760",
  tidal: "#000000",
  qobuz: "#0E67B4",
  ytmusic: "#FF0000",
  deezer: "#FF0092",
  apple_music: "#FA2D48",
};

export const MEDIA_TYPE_EMOJI = {
  track: "🎵",
  artist: "🎤",
  playlist: "📋",
};
