<script setup lang="ts">
import type { ProviderDomain } from "@/types";
import { PROVIDER_LABELS, PROVIDER_COLORS, PROVIDER_ICONS } from "@/constants";

defineProps<{
  links: Record<ProviderDomain, string>;
}>();
</script>

<template>
  <div v-if="Object.keys(links).length" class="provider-buttons">
    <a
      v-for="[domain, url] in Object.entries(links)"
      :key="domain"
      :href="url"
      target="_blank"
      rel="noopener"
      class="provider-btn"
      :style="{
        borderColor: PROVIDER_COLORS[domain as ProviderDomain] + '66',
        color: PROVIDER_COLORS[domain as ProviderDomain],
      }"
    >
      <span v-html="PROVIDER_ICONS[domain as ProviderDomain]"></span>
      {{ PROVIDER_LABELS[domain as ProviderDomain] || domain }}
    </a>
  </div>
</template>

<style scoped>
.provider-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.provider-btn {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.5rem 0.9rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: opacity 0.15s;
}

.provider-btn:hover {
  opacity: 0.85;
}

.provider-btn :deep(svg) {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>
