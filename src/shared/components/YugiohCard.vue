<template>
  <q-card
    flat
    bordered
    class="dt-yugioh-card dt-glass-surface dt-holo-border"
    :class="cardClasses"
    @click="handleClick"
  >
    <div class="dt-yugioh-card__image-wrapper">
      <q-img
        :src="imageUrl"
        :alt="title"
        class="dt-yugioh-card__image"
        ratio="2/3"
        loading="lazy"
      >
        <template #error>
          <div class="dt-yugioh-card__image-fallback">
            <q-icon name="image_not_supported" size="32px" />
          </div>
        </template>
      </q-img>

      <div
        v-if="badgeLabel"
        class="dt-yugioh-card__rarity"
        :data-variant="rarityVariant"
      >
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

type YugiohRarity =
  | 'common'
  | 'rare'
  | 'super-rare'
  | 'ultra-rare'
  | 'secret-rare';

interface YugiohCardProps {
  title: string;
  imageUrl: string;
  subtitle?: string;
  description?: string;
  rarityLabel?: string;
  rarityVariant?: YugiohRarity;
  interactive?: boolean;
  selected?: boolean;
}

const props = withDefaults(defineProps<YugiohCardProps>(), {
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
  background: linear-gradient(
    135deg,
    rgba(0, 242, 255, 0.08),
    rgba(24, 28, 53, 0.9)
  );
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
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: linear-gradient(
    90deg,
    rgba(0, 242, 255, 0.85),
    rgba(255, 215, 0, 0.9)
  );
  color: #020617;
  box-shadow:
    0 0 10px rgba(0, 242, 255, 0.7),
    0 0 18px rgba(255, 215, 0, 0.8);
}

.dt-yugioh-card__rarity[data-variant='common'] {
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.8),
    rgba(55, 65, 81, 0.9)
  );
  color: #e5e7eb;
}

.dt-yugioh-card__rarity[data-variant='rare'] {
  background: linear-gradient(
    90deg,
    rgba(56, 189, 248, 0.9),
    rgba(37, 99, 235, 0.95)
  );
}

.dt-yugioh-card__rarity[data-variant='super-rare'] {
  background: linear-gradient(
    120deg,
    rgba(129, 140, 248, 0.95),
    rgba(56, 189, 248, 0.9)
  );
}

.dt-yugioh-card__rarity[data-variant='ultra-rare'] {
  background: linear-gradient(
    120deg,
    rgba(234, 179, 8, 0.95),
    rgba(251, 191, 36, 0.95)
  );
}

.dt-yugioh-card__rarity[data-variant='secret-rare'] {
  background: linear-gradient(
    120deg,
    rgba(236, 72, 153, 0.95),
    rgba(59, 130, 246, 0.95),
    rgba(45, 212, 191, 0.95)
  );
}

.dt-yugioh-card__body {
  padding: 12px 14px 14px;
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
</style>

