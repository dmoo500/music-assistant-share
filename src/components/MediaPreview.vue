<script setup lang="ts">
import { computed } from "vue";

import type { SharePayload } from "@/types";
import { MEDIA_TYPE_EMOJI } from "@/constants";
import { expandArtworkRef } from "@/helpers/share";

const props = defineProps<{
  payload: SharePayload | null;
}>();

const artworkUrl = computed(() =>
  props.payload?.art_ref ? expandArtworkRef(props.payload.art_ref) : undefined,
);
</script>

<template>
  <section v-if="payload" class="preview">
    <img
      v-if="artworkUrl"
      :src="artworkUrl"
      :alt="payload.title || ''"
      class="art"
      @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
    />
    <div v-else class="art-placeholder">
      {{ MEDIA_TYPE_EMOJI[payload.type] || "🎵" }}
    </div>
    <div class="art-shade" />
    <div class="brand">
      <img src="/favicon.svg" alt="" class="brand-mark" />
      <span>Music Assistant</span>
    </div>
    <div class="meta">
      <h1 class="title">{{ payload.title || "Unknown" }}</h1>
      <p v-if="payload.artist" class="subtitle artist">{{ payload.artist }}</p>
      <p v-if="payload.album" class="subtitle album">{{ payload.album }}</p>
    </div>
  </section>

  <section v-else class="preview preview-loading" aria-label="Loading preview">
    <div class="art-placeholder">🎵</div>
    <div class="meta">
      <h1 class="title">Loading…</h1>
    </div>
  </section>
</template>

<style scoped>
.preview {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: 300px;
  aspect-ratio: 16 / 10;
  align-items: flex-end;
  overflow: hidden;
  border-radius: 10px;
  background: var(--color-bg-tertiary);
  color: white;
}

.preview-loading {
  min-height: 80px;
  aspect-ratio: auto;
  color: var(--color-text-primary);
}

.art {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.art-placeholder {
  position: absolute;
  inset: 0;
  z-index: -2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
  font-size: 4rem;
}

.art-shade {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(0deg, rgb(0 0 0 / 88%), rgb(0 0 0 / 8%) 78%);
}

.brand {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-shadow: 0 1px 4px rgb(0 0 0 / 50%);
}

.brand-mark {
  width: 18px;
  height: 18px;
}

.meta {
  width: 100%;
  min-width: 0;
  padding: 1.15rem;
  text-shadow: 0 1px 8px rgb(0 0 0 / 55%);
}

.title {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.15;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artist {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.album {
  margin: 0.1rem 0 0;
  color: rgb(255 255 255 / 78%);
  font-size: 0.78rem;
}

@media (max-width: 520px) {
  .preview {
    min-height: 240px;
  }
}
</style>
