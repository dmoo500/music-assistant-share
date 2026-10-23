<script setup lang="ts">
import { PROVIDER_LABELS } from "@/constants";
import {
  createMusicAssistantUrl,
  encodeSharePayload,
  expandProviderRefs,
} from "@/helpers/share";
import type { PlaylistTrack, ProviderDomain } from "@/types";

const props = defineProps<{
  tracks: PlaylistTrack[];
  maUrl: string;
}>();

function safeTrackLinks(track: PlaylistTrack): [ProviderDomain, string][] {
  return Object.entries(expandProviderRefs(track.provider_refs) ?? {}).flatMap(
    ([domain, url]) =>
      domain in PROVIDER_LABELS ? [[domain as ProviderDomain, url]] : [],
  );
}

function musicAssistantTrackUrl(track: PlaylistTrack): string | undefined {
  try {
    const payload = {
      v: 2 as const,
      type: "track" as const,
      title: track.title,
      artist: track.artist,
      album: track.album,
      isrc: track.isrc,
      mbid: track.mbid,
      mb_track: track.mb_track,
      provider_refs: track.provider_refs,
    };
    return createMusicAssistantUrl(
      props.maUrl,
      encodeSharePayload(payload),
    );
  } catch {
    return undefined;
  }
}
</script>

<template>
  <ol v-if="tracks.length" class="tracklist">
    <li
      v-for="(track, trackIndex) in tracks"
      :key="`${trackIndex}-${track.title}`"
      class="tracklist-item"
    >
      <span class="t-num">{{ trackIndex + 1 }}.</span>
      <span class="t-title">{{ track.title || "?" }}</span>
      <span class="t-artist">
        {{ [track.artist, track.album].filter(Boolean).join(" · ") }}
      </span>
      <span v-if="track.provider_refs || maUrl" class="track-links">
        <a
          v-if="musicAssistantTrackUrl(track)"
          :href="musicAssistantTrackUrl(track)"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`Open ${track.title} in Music Assistant`"
        >
          Open in Music Assistant
        </a>
        <a
          v-for="[domain, url] in safeTrackLinks(track)"
          :key="domain"
          :href="url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`Open ${PROVIDER_LABELS[domain]} link for ${track.title}`"
        >
          {{ PROVIDER_LABELS[domain] }}
        </a>
      </span>
    </li>
  </ol>
</template>

<style scoped>
.tracklist {
  margin: 0.9rem 0;
  max-height: 200px;
  overflow-y: auto;
  border-top: 1px solid var(--color-border);
}

.tracklist-item {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.55rem 0.25rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.82rem;
}

.t-num {
  min-width: 1.5rem;
  color: var(--color-text-tertiary);
  text-align: right;
}

.t-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.t-artist {
  overflow: hidden;
  color: var(--color-text-tertiary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-links {
  display: flex;
  flex-basis: 100%;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-left: 2rem;
  font-size: 0.72rem;
}

.track-links a {
  color: var(--color-accent);
  text-decoration: none;
}
</style>