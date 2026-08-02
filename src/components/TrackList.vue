<script setup lang="ts">
import type { PlaylistTrack } from "@/types";

defineProps<{
  tracks: PlaylistTrack[];
}>();
</script>

<template>
  <div v-if="tracks.length" class="tracklist">
    <div v-for="(track, i) in tracks" :key="i" class="tracklist-item">
      <span class="t-num">{{ i + 1 }}.</span>
      <span class="t-title">{{ track.title || "?" }}</span>
      <span class="t-artist">{{ track.artist || "" }}</span>
    </div>
  </div>
</template>

<style scoped>
.tracklist {
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--color-bg-tertiary);
  border-radius: 8px;
}

.tracklist-item {
  padding: 0.45rem 0.75rem;
  font-size: 0.82rem;
  border-bottom: 1px solid var(--color-bg-tertiary);
  display: flex;
  gap: 0.5rem;
}

.tracklist-item:last-child {
  border-bottom: none;
}

.t-num {
  color: #555;
  min-width: 1.5rem;
  text-align: right;
}

.t-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.t-artist {
  color: var(--color-text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
