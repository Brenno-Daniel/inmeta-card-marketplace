<template>
  <!-- Inventory variant: deck box card (image + name + rarity, bordered) -->
  <div
    v-if="variant === 'inventory'"
    class="dt-yugioh-card dt-yugioh-card--inventory"
    :class="cardClasses"
    @click="handleClick"
  >
    <div class="dt-yugioh-card__image-wrapper">
      <div v-if="selected" class="dt-yugioh-card__selection-overlay" aria-hidden="true">
        <q-icon name="check_circle" size="24px" class="dt-yugioh-card__selection-check" />
      </div>
      <q-img :src="imageUrl" :alt="title" class="dt-yugioh-card__image" loading="lazy">
        <template #error>
          <div class="dt-yugioh-card__image-fallback">
            <q-icon name="image_not_supported" size="24px" />
          </div>
        </template>
      </q-img>
    </div>
    <div class="dt-yugioh-card__body">
      <div class="dt-yugioh-card__title dt-heading-orbitron">
        {{ title }}
      </div>
      <div
        v-if="badgeLabel"
        class="dt-yugioh-card__rarity dt-yugioh-card__rarity--below"
        :data-variant="rarityVariant"
      >
        {{ badgeLabel }}
      </div>
    </div>
  </div>

  <!-- Compact variant: image + name + rarity pill (same size for trade columns) -->
  <div
    v-else-if="variant === 'compact'"
    class="dt-yugioh-card dt-yugioh-card--compact"
    :class="cardClasses"
    @click="handleClick"
  >
    <div class="dt-yugioh-card__image-wrapper">
      <div v-if="selected" class="dt-yugioh-card__selection-overlay" aria-hidden="true">
        <q-icon name="check_circle" size="20px" class="dt-yugioh-card__selection-check" />
      </div>
      <q-img :src="imageUrl" :alt="title" class="dt-yugioh-card__image" loading="lazy">
        <template #error>
          <div class="dt-yugioh-card__image-fallback">
            <q-icon name="image_not_supported" size="24px" />
          </div>
        </template>
      </q-img>
    </div>
    <div class="dt-yugioh-card__body q-mt-sm">
      <div class="dt-yugioh-card__title dt-heading-orbitron">
        {{ title }}
      </div>
      <div
        v-if="badgeLabel"
        class="dt-yugioh-card__rarity dt-yugioh-card__rarity--below"
        :data-variant="rarityVariant"
      >
        {{ badgeLabel }}
      </div>
    </div>
  </div>

  <!-- Default variant: full card with optional overlay rarity -->
  <q-card
    v-else
    flat
    bordered
    class="dt-yugioh-card dt-glass-surface dt-holo-border"
    :class="cardClasses"
    @click="handleClick"
  >
    <div class="dt-yugioh-card__image-wrapper">
      <q-img :src="imageUrl" :alt="title" class="dt-yugioh-card__image" ratio="2/3" loading="lazy">
        <template #error>
          <div class="dt-yugioh-card__image-fallback">
            <q-icon name="image_not_supported" size="32px" />
          </div>
        </template>
      </q-img>

      <div v-if="badgeLabel" class="dt-yugioh-card__rarity" :data-variant="rarityVariant">
        <span>{{ badgeLabel }}</span>
      </div>
    </div>

    <q-card-section class="dt-yugioh-card__body">
      <div class="dt-yugioh-card__title dt-heading-orbitron dt-glow-text-cyan">
        {{ title }}
      </div>

      <div v-if="subtitle" class="dt-yugioh-card__subtitle dt-text-muted">
        {{ subtitle }}
      </div>

      <div v-if="description" class="dt-yugioh-card__description">
        {{ description }}
      </div>

      <slot name="footer" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type YugiohRarity = 'common' | 'rare' | 'super-rare' | 'ultra-rare' | 'secret-rare';

type YugiohCardVariant = 'default' | 'compact' | 'inventory';

interface YugiohCardProps {
  title: string;
  imageUrl: string;
  subtitle?: string;
  description?: string;
  rarityLabel?: string;
  rarityVariant?: YugiohRarity;
  variant?: YugiohCardVariant;
  interactive?: boolean;
  selected?: boolean;
}

const props = withDefaults(defineProps<YugiohCardProps>(), {
  variant: 'default',
  interactive: true,
  selected: false,
});

const emit = defineEmits<{
  (event: 'click'): void;
}>();

const badgeLabel = computed(() => props.rarityLabel);

const cardClasses = computed(() => ({
  'dt-yugioh-card--interactive': props.interactive,
  'dt-yugioh-card--selected': props.selected,
}));

function handleClick(): void {
  if (!props.interactive) {
    return;
  }

  emit('click');
}
</script>

<style scoped>
.dt-yugioh-card__image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 14px 14px 0 0;
}

.dt-yugioh-card__selection-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 8px;
  z-index: 1;
  pointer-events: none;
}

.dt-yugioh-card__selection-check {
  color: var(--dt-color-millennium-gold);
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.8));
}

.dt-yugioh-card__image {
  transition: transform 260ms ease-out;
}

.dt-yugioh-card--interactive:hover .dt-yugioh-card__image {
  transform: scale(1.04);
}

.dt-yugioh-card__image-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 242, 255, 0.08), rgba(24, 28, 53, 0.9));
}

.dt-yugioh-card__rarity {
  position: absolute;
  inset-inline: 10px;
  bottom: 10px;
  display: inline-flex;
  justify-content: center;
  padding: 4px 10px;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-radius: 999px;
}

.dt-yugioh-card__body {
  padding: 12px 14px 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
}

.dt-yugioh-card__title {
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.dt-yugioh-card__subtitle {
  font-size: 0.75rem;
  margin-bottom: 6px;
}

.dt-yugioh-card__description {
  font-size: 0.75rem;
  line-height: 1.2;
  max-height: 3.3em;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Compact variant (trade columns): same size, image + name + rarity below */
.dt-yugioh-card--compact {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: transparent;
  border: none;
  box-shadow: none;
  cursor: default;
}

.dt-yugioh-card--compact.dt-yugioh-card--selected .dt-yugioh-card__image-wrapper {
  border-color: var(--dt-color-millennium-gold);
  box-shadow: 0 0 0 1px rgba(255, 215, 0, 0.5);
}

.dt-yugioh-card--compact .dt-yugioh-card__image-wrapper {
  border-radius: 10px;
  border: 1px solid var(--dt-color-border-glass);
  aspect-ratio: 2 / 3;
  min-height: 0;
}

.dt-yugioh-card--compact .dt-yugioh-card__body {
  padding: 8px 0 0;
  flex: 0 0 auto;
}

.dt-yugioh-card--compact .dt-yugioh-card__title {
  font-size: 0.8rem;
  color: var(--dt-text-primary);
  text-align: center;
  line-height: 1.2;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dt-yugioh-card__rarity--below {
  position: static;
  inset: auto;
  display: inline-flex;
  width: 100%;
  justify-content: center;
  padding: 4px 8px;
  font-size: 0.6rem;
  border-radius: 6px;
  color: #fff;
}

.dt-yugioh-card__rarity--below[data-variant='ultra-rare'] {
  color: var(--dt-color-millennium-gold);
}

.dt-yugioh-card__rarity--below[data-variant='secret-rare'] {
  color: #a78bfa;
}

.dt-yugioh-card__rarity--below[data-variant='super-rare'] {
  color: var(--dt-color-cyber-blue);
}

.dt-yugioh-card__rarity--below[data-variant='rare'] {
  color: var(--dt-color-cyber-blue);
}

.dt-yugioh-card__rarity--below[data-variant='common'] {
  color: var(--dt-text-muted);
}

/* Inventory variant (deck box): bordered card, image + name + rarity */
.dt-yugioh-card--inventory {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: 12px;
  border: 1px solid rgba(29, 17, 53, 0.9);
  overflow: hidden;
  background: rgba(11, 16, 32, 0.6);
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.dt-yugioh-card--inventory:hover {
  border-color: var(--dt-color-cyber-blue);
  box-shadow: 0 0 12px rgba(0, 242, 255, 0.2);
}

.dt-yugioh-card--inventory.dt-yugioh-card--selected {
  border-color: var(--dt-color-millennium-gold);
  box-shadow: 0 0 0 1px rgba(255, 215, 0, 0.5);
}

.dt-yugioh-card--inventory .dt-yugioh-card__image-wrapper {
  border-radius: 12px 12px 0 0;
  border: none;
  aspect-ratio: 2 / 3;
  min-height: 0;
}

.dt-yugioh-card--inventory .dt-yugioh-card__body {
  padding: 10px 12px 12px;
  flex: 0 0 auto;
}

.dt-yugioh-card--inventory .dt-yugioh-card__title {
  font-size: 0.82rem;
  color: var(--dt-text-primary);
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
