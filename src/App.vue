<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useStorage } from "@vueuse/core";
import { Save } from "@lucide/vue";
import type { SharePayload } from "@/types";
import { DEFAULT_INSTANCE_URL, LEGACY_DEFAULT_INSTANCE_URL, STORAGE_KEY } from "@/constants";
import MediaPreview from "@/components/MediaPreview.vue";
import ProviderLinks from "@/components/ProviderLinks.vue";
import TrackList from "@/components/TrackList.vue";
import {
  createMusicAssistantUrl,
  expandArtworkRef,
  expandProviderRefs,
  parseInstanceUrl,
  sanitizeProviderRefs,
} from "@/helpers/share";

const payload = ref<SharePayload | null>(null);
const maUrl = useStorage(STORAGE_KEY, "");
const error = ref("");

const pageTitle = computed(() => {
  if (!payload.value?.title) return "Music Assistant – Open in your instance";
  return `${payload.value.title} – Music Assistant`;
});

watch(
  pageTitle,
  (title) => {
    document.title = title;
  },
  { immediate: true }
);

function decodePayload(): void {
  payload.value = null;
  error.value = "";
  try {
    const raw = location.hash.slice(1);
    if (!raw) {
      error.value = "No share data found in URL.";
      return;
    }

    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const value: unknown = JSON.parse(decoded);
    if (!value || typeof value !== "object") throw new Error("Invalid payload");
    const candidate = value as Record<string, unknown>;
    if (
      !["track", "album", "artist", "playlist"].includes(String(candidate.type)) ||
      typeof candidate.title !== "string" ||
      !candidate.title.trim() ||
      (candidate.version !== undefined && typeof candidate.version !== "string")
    ) {
      throw new Error("Invalid payload");
    }
    if (
      candidate.type === "playlist" &&
      (!Array.isArray(candidate.tracks) ||
        candidate.tracks.some(
          (track) =>
            !track ||
            typeof track.title !== "string" ||
            (track.version !== undefined && typeof track.version !== "string")
        ))
    ) {
      throw new Error("Invalid playlist payload");
    }
    const decodedPayload = candidate as unknown as SharePayload;
    payload.value = {
      ...decodedPayload,
      art_ref:
        typeof candidate.art_ref === "string" && expandArtworkRef(candidate.art_ref)
          ? candidate.art_ref
          : undefined,
      provider_refs: sanitizeProviderRefs(candidate.provider_refs),
      tracks: decodedPayload.tracks?.map((track) => ({
        ...track,
        provider_refs: sanitizeProviderRefs(track.provider_refs),
      })),
    };
  } catch {
    error.value = "Could not decode share link. It may be corrupted.";
  }
}

function saveUrl(): void {
  try {
    validateInstanceUrl(maUrl.value);
    error.value = "";
  } catch {
    error.value = "Please enter a valid HTTP or HTTPS URL.";
  }
}

function validateInstanceUrl(value: string): URL {
  return parseInstanceUrl(value);
}

function openInMusicAssistant(): void {
  if (!payload.value) {
    error.value = "No share data found.";
    return;
  }
  try {
    const raw = location.hash.slice(1);
    const url = createMusicAssistantUrl(maUrl.value, raw);
    window.open(url, "_blank", "noopener,noreferrer");
    error.value = "";
  } catch {
    error.value = "Please enter a valid HTTP or HTTPS URL.";
  }
}

onMounted(() => {
  decodePayload();
  window.addEventListener("hashchange", decodePayload);

  // Auto-fill URL if empty
  if (!maUrl.value || maUrl.value === LEGACY_DEFAULT_INSTANCE_URL) {
    maUrl.value = DEFAULT_INSTANCE_URL;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("hashchange", decodePayload);
});
</script>

<template>
  <div class="card">
    <MediaPreview :payload="payload" />

    <ProviderLinks
      v-if="payload?.provider_refs"
      :links="expandProviderRefs(payload.provider_refs) ?? {}"
    />

    <TrackList
      v-if="payload?.type === 'playlist' && payload.tracks"
      :tracks="payload.tracks"
      :ma-url="maUrl"
    />

    <!-- MA Instance URL Input -->
    <div class="url-row">
      <input
        v-model.trim="maUrl"
        type="url"
        placeholder="http://musicassistant.local:8095"
        class="url-input"
        @keyup.enter="openInMusicAssistant"
      />
      <button
        @click="saveUrl"
        class="btn-save"
        title="Save MA URL"
        aria-label="Save Music Assistant URL"
      >
        <Save :size="18" aria-hidden="true" />
      </button>
    </div>

    <!-- Open Button -->
    <button @click="openInMusicAssistant" class="btn-open">Open in Music Assistant</button>

    <!-- Hint -->
    <p class="hint">
      Enter the address of your Music Assistant instance above.<br />
      It is saved in your browser for next time.
    </p>

    <!-- Error Message -->
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 1rem;
  max-width: 560px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
}

.url-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.url-input {
  flex: 1;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  font-size: 0.9rem;
  padding: 0.6rem 0.75rem;
  outline: none;
  transition: border-color 0.15s;
}

.url-input:focus {
  border-color: var(--color-accent);
}

button {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.75rem 1.25rem;
  transition: opacity 0.15s;
}

button:hover {
  opacity: 0.85;
}

.btn-open {
  width: 100%;
  background: var(--color-accent);
  color: #000;
  margin-bottom: 0.75rem;
}

.btn-save {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 42px;
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  padding: 0;
}

.hint {
  font-size: 0.78rem;
  color: #666;
  margin-top: 0.5rem;
  text-align: center;
}

.error {
  background: rgba(207, 102, 121, 0.12);
  border: 1px solid rgba(207, 102, 121, 0.4);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: var(--color-error);
  margin-top: 1rem;
}
</style>
