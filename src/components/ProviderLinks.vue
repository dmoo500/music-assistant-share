<script setup lang="ts">
import type { ProviderDomain } from "@/types";
import { PROVIDER_LABELS } from "@/constants";
import { safeProviderUrl } from "@/helpers/share";
import { computed, ref } from "vue";
import { Copy } from "@lucide/vue";

const props = defineProps<{
  links: Partial<Record<ProviderDomain, string>>;
}>();
const copiedDomain = ref<ProviderDomain>();

const safeLinks = computed(() =>
  Object.entries(props.links).flatMap(([domain, value]) => {
    const url = safeProviderUrl(domain, value);
    return url && domain in PROVIDER_LABELS
      ? [[domain as ProviderDomain, url] as const]
      : [];
  }),
);

function getProviderIconUrl(domain: ProviderDomain): string {
  return `/provider-icons/${domain}.svg`;
}

async function copyLink(domain: ProviderDomain, url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url);
    copiedDomain.value = domain;
  } catch {
    copiedDomain.value = undefined;
  }
}
</script>

<template>
  <div v-if="safeLinks.length" class="provider-list">
    <div v-for="[domain, url] in safeLinks" :key="domain" class="provider-row">
      <img
        :src="getProviderIconUrl(domain)"
        :alt="PROVIDER_LABELS[domain]"
        class="provider-icon"
      />
      <div class="provider-info">
        <span class="provider-name">{{ PROVIDER_LABELS[domain] }}</span>
        <a
          :href="url"
          target="_blank"
          rel="noopener noreferrer"
          class="provider-url"
        >
          {{ url }}
        </a>
      </div>
      <button
        type="button"
        class="copy-button"
        :aria-label="
          copiedDomain === domain
            ? `${PROVIDER_LABELS[domain]} link copied`
            : `Copy ${PROVIDER_LABELS[domain]} link`
        "
        :title="copiedDomain === domain ? 'Copied' : 'Copy link'"
        @click="copyLink(domain, url)"
      >
        <Copy :size="16" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.provider-list {
  display: flex;
  flex-direction: column;
  margin: 0.9rem 0;
}

.provider-row {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--color-border);
}

.provider-row:first-child {
  border-top: 1px solid var(--color-border);
}

.provider-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.provider-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 0.15rem;
}

.provider-name {
  font-size: 0.82rem;
  font-weight: 600;
}

.provider-url {
  display: block;
  overflow: hidden;
  color: var(--color-text-tertiary);
  font-size: 0.7rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
}

.copy-button:hover {
  background: var(--color-bg-tertiary);
}
</style>
