import type { ProviderDomain, SharePayload } from "@/types";

export type ProviderLinks = Partial<Record<ProviderDomain, string>> | undefined;

const PROVIDER_HOSTS: Record<ProviderDomain, readonly string[]> = {
  spotify: ["open.spotify.com"],
  tidal: ["tidal.com", "www.tidal.com"],
  qobuz: ["open.qobuz.com"],
  ytmusic: ["music.youtube.com"],
  deezer: ["deezer.com", "www.deezer.com"],
  apple_music: ["music.apple.com"],
};
const PROVIDER_BASE_URLS: Record<ProviderDomain, string> = {
  spotify: "https://open.spotify.com",
  tidal: "https://tidal.com",
  qobuz: "https://open.qobuz.com",
  ytmusic: "https://music.youtube.com",
  deezer: "https://www.deezer.com",
  apple_music: "https://music.apple.com",
};
const ARTWORK_SUFFIXES: Record<string, string> = {
  m: "mzstatic.com",
  s: "scdn.co",
  t: "tidal.com",
  q: "qobuz.com",
  d: "dzcdn.net",
  b: "bcbits.com",
  g: "googleusercontent.com",
  y: "ytimg.com",
  c: "coverartarchive.org",
  a: "archive.org",
  u: "theaudiodb.com",
  f: "fanart.tv",
  l: "last.fm",
  L: "lastfm.freetls.fastly.net",
  z: "ssl-images-amazon.com",
};

export function safeProviderUrl(domain: string, value: string): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(PROVIDER_HOSTS, domain)) {
    return undefined;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      PROVIDER_HOSTS[domain as ProviderDomain].includes(
        url.hostname.toLowerCase(),
      )
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

export function safeArtworkUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !Object.values(ARTWORK_SUFFIXES).some(
        (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
      )
    ) {
      return undefined;
    }
    return url.href;
  } catch {
    return undefined;
  }
}

export function expandArtworkRef(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const separator = value.indexOf(":");
  if (separator <= 0) return undefined;
  const code = value.slice(0, separator);
  const hostAndPath = value.slice(separator + 1);
  const suffix = ARTWORK_SUFFIXES[code];
  if (!suffix || !hostAndPath) return undefined;
  let subdomain = "";
  let path = hostAndPath;
  if (!hostAndPath.startsWith("/")) {
    const subdomainEnd = hostAndPath.indexOf(":/");
    if (subdomainEnd <= 0) return undefined;
    subdomain = hostAndPath.slice(0, subdomainEnd);
    path = hostAndPath.slice(subdomainEnd + 1);
  }
  if (!path.startsWith("/")) return undefined;
  if (subdomain && !subdomain.split(".").every((part) => /^[a-z0-9-]+$/i.test(part))) {
    return undefined;
  }
  return safeArtworkUrl(`https://${subdomain ? `${subdomain}.` : ""}${suffix}${path}`);
}

export function expandProviderRefs(value: unknown): ProviderLinks {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const links = Object.fromEntries(
    Object.entries(value).flatMap(([domain, ref]) => {
      if (
        typeof ref !== "string" ||
        !Object.prototype.hasOwnProperty.call(PROVIDER_BASE_URLS, domain) ||
        !ref.startsWith("/") ||
        ref.startsWith("//") ||
        ref.includes("\\")
      ) {
        return [];
      }
      try {
        const url = new URL(ref, PROVIDER_BASE_URLS[domain as ProviderDomain]);
        const safeUrl = safeProviderUrl(domain, url.href);
        return safeUrl ? [[domain, safeUrl]] : [];
      } catch {
        return [];
      }
    }),
  );
  return Object.keys(links).length
    ? (links as ProviderLinks)
    : undefined;
}

export function sanitizeProviderRefs(value: unknown): ProviderLinks {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const refs = Object.fromEntries(
    Object.entries(value).flatMap(([domain, ref]) => {
      if (
        typeof ref !== "string" ||
        !Object.prototype.hasOwnProperty.call(PROVIDER_BASE_URLS, domain) ||
        !ref.startsWith("/") ||
        ref.startsWith("//") ||
        ref.includes("\\")
      ) {
        return [];
      }
      return expandProviderRefs({ [domain]: ref }) ? [[domain, ref]] : [];
    }),
  );
  return Object.keys(refs).length
    ? (refs as Exclude<ProviderLinks, undefined>)
    : undefined;
}

export function parseInstanceUrl(value: string): URL {
  const url = new URL(value.trim());
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error("Unsupported instance URL");
  }
  return url;
}

export function encodeSharePayload(payload: SharePayload): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function createMusicAssistantUrl(
  instanceUrl: string,
  encodedPayload: string,
): string {
  const url = parseInstanceUrl(instanceUrl);
  url.hash = `/share?payload=${encodeURIComponent(encodedPayload)}`;
  return url.toString();
}