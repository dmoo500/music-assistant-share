<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useStorage } from "@vueuse/core";
import type { SharePayload } from "@/types";
import { STORAGE_KEY, COMMON_URLS } from "@/constants";
import MediaPreview from "@/components/MediaPreview.vue";
import ProviderLinks from "@/components/ProviderLinks.vue";
import TrackList from "@/components/TrackList.vue";

const payload = ref<SharePayload | null>(null);
const maUrl = useStorage(STORAGE_KEY, "");
const error = ref("");

const pageTitle = computed(() => {
  if (!payload.value?.title) return "Music Assistant – Open in your instance";
  return `${payload.value.title} – Music Assistant`;
});

function decodePayload(): void {
  try {
    const raw = location.hash.slice(1);
    if (!raw) {
      error.value = "No share data found in URL.";
      return;
    }

    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    payload.value = JSON.parse(decoded);
  } catch (e) {
    error.value = "Could not decode share link. It may be corrupted.";
    console.error("Decode error:", e);
  }
}

function saveUrl(): void {
  if (!maUrl.value.trim()) {
    error.value = "Please enter a valid URL.";
    return;
  }
  error.value = "";
}

function openInMusicAssistant(): void {
  if (!maUrl.value.trim()) {
    error.value = "Please enter the URL of your Music Assistant instance.";
    return;
  }

  if (!payload.value?.uri) {
    error.value = "No media URI found in share link.";
    return;
  }

  try {
    const url = new URL(maUrl.value);
    url.hash = `/item/${payload.value.uri}`;
    window.open(url.toString(), "_blank");
    error.value = "";
  } catch (e) {
    error.value = "Invalid Music Assistant URL.";
    console.error("URL error:", e);
  }
}

onMounted(() => {
  decodePayload();
  document.title = pageTitle.value;

  // Auto-fill URL if empty
  if (!maUrl.value && COMMON_URLS.length) {
    maUrl.value = COMMON_URLS[0];
  }
});
</script>

<template>
  <div class="card">
    <!-- Logo & Branding -->
    <div class="logo">
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="logo-icon"
      >
        <path
          d="m 109.394,4.3814 c 5.848,-5.84187 15.394,-5.84187 21.212,0 l 98.788,98.8876 c 5.848,5.842 10.606,17.374 10.606,25.638 v 90.11 l -0.005,0.356 c -0.206,8.086 -6.881,14.628 -14.995,14.628 H 15 C 6.75759,234.001 2.40473e-5,227.22 0,218.987 v -90.11 c 1.20331e-4,-8.264 4.78834,-19.796 10.6064,-25.638 z"
          fill="#f2f4f9"
        />
        <path
          d="m 109.394,4.3814 c 5.848,-5.84187 15.394,-5.84187 21.212,0 l 98.788,98.8876 c 5.848,5.842 10.606,17.374 10.606,25.638 v 90.11 l -0.005,0.356 c -0.206,8.086 -6.881,14.628 -14.995,14.628 H 15 C 6.75759,234.001 2.40473e-5,227.22 0,218.987 v -90.11 c 1.20331e-4,-8.264 4.78834,-19.796 10.6064,-25.638 z M 36,120.001 c -4.4183,0 -8,3.581 -8,8 v 78 h 16 v -78 c 0,-4.419 -3.5817,-8 -8,-8 z m 32,0 c -4.4183,0 -8,3.581 -8,8 v 78 h 16 v -78 c 0,-4.419 -3.5817,-8 -8,-8 z m 32,0 c -4.4183,0 -8,3.581 -8,8 v 78 h 16 v -78 c 0,-4.419 -3.582,-8 -8,-8 z m 58.393,0.426 c -4.193,-1.395 -8.722,0.873 -10.118,5.065 l -26.796,80.509 h 16.863 l 25.114,-75.457 c 1.395,-4.192 -0.872,-8.721 -5.063,-10.117 z m 30.315,5.065 c -1.395,-4.192 -5.925,-6.46 -10.117,-5.065 -4.192,1.396 -6.46,5.925 -5.065,10.117 l 25.116,75.457 h 16.862 z"
          fill="#18bcf2"
        />
      </svg>
      <a
        href="https://music-assistant.io"
        target="_blank"
        rel="noopener"
        class="logo-link"
      >
        Music Assistant
      </a>
    </div>

    <!-- Media Preview -->
    <MediaPreview :payload="payload" />

    <!-- MA Instance URL Input -->
    <div class="url-row">
      <input
        v-model.trim="maUrl"
        type="url"
        placeholder="http://homeassistant.local:8095"
        class="url-input"
        @keyup.enter="openInMusicAssistant"
      />
      <button
        @click="saveUrl"
        class="btn-save"
        title="Save MA URL"
        aria-label="Save Music Assistant URL"
      >
        💾
      </button>
    </div>

    <!-- Provider Links -->
    <ProviderLinks v-if="payload?.links" :links="payload.links" />

    <!-- Track List (for playlists) -->
    <TrackList
      v-if="payload?.type === 'playlist' && payload.tracks"
      :tracks="payload.tracks"
    />

    <!-- Open Button -->
    <button @click="openInMusicAssistant" class="btn-open">
      Open in Music Assistant
    </button>

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
  border-radius: 16px;
  padding: 2rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
}

.logo-icon {
  width: 24px;
  height: 24px;
}

.logo-link {
  color: inherit;
  text-decoration: none;
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
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  padding: 0.6rem 0.9rem;
  font-size: 0.85rem;
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
