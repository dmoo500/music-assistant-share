<script setup lang="ts">
import type { SharePayload } from "@/types";
import { MEDIA_TYPE_EMOJI } from "@/constants";

defineProps<{
  payload: SharePayload | null;
}>();
</script>

<template>
  <div v-if="payload" class="preview">
    <img
      v-if="payload.art"
      :src="payload.art"
      :alt="payload.title || ''"
      class="art"
      @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
    />
    <div v-else class="art-placeholder">
      {{ MEDIA_TYPE_EMOJI[payload.type] || "🎵" }}
    </div>

    <div class="meta">
      <h1 class="title">{{ payload.title || "Unknown" }}</h1>
      <p v-if="payload.artist || payload.album" class="subtitle">
        <template v-if="payload.artist">{{ payload.artist }}</template>
        <template v-if="payload.artist && payload.album"> · </template>
        <template v-if="payload.album">{{ payload.album }}</template>
      </p>
    </div>
  </div>

  <div v-else class="preview">
    <div class="art-placeholder">🎵</div>
    <div class="meta">
      <h1 class="title">Loading…</h1>
      <p class="subtitle"></p>
    </div>
  </div>
</template>

<style scoped>
.preview {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.art {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--color-bg-tertiary);
  flex-shrink: 0;
}

.art-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: var(--color-bg-tertiary);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.meta {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
