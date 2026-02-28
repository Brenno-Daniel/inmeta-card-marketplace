<template>
  <q-page class="trade-page">
    <header class="trade-page__header column items-center text-center q-gutter-y-sm">
      <h1 class="dt-heading-orbitron trade-page__title dt-glow-text-gold">Create Trade Offer</h1>
      <p class="trade-page__subtitle dt-text-muted">
        Select a card from your inventory to offer as tribute, and choose the card you desire from
        the global database.
      </p>
    </header>

    <div class="trade-wizard dt-glass-surface dt-holo-border">
      <div class="trade-wizard__columns">
        <!-- Left: Your Tribute -->
        <div class="trade-wizard__column">
          <div class="trade-wizard__column-header">
            <span class="trade-wizard__step-badge">1</span>
            <span class="dt-heading-orbitron trade-wizard__column-title">Your Tribute</span>
          </div>

          <q-inner-loading :showing="tradeStore.isLoadingMyCards">
            <q-spinner-gears color="primary" size="48px" />
          </q-inner-loading>

          <div
            v-if="!tradeStore.isLoadingMyCards && !tradeStore.myCards.length"
            class="trade-wizard__empty column items-center justify-center"
          >
            <q-icon name="inventory_2" size="40px" class="dt-text-muted" />
            <span class="text-caption dt-text-muted">No cards in your vault.</span>
            <q-btn
              flat
              no-caps
              color="primary"
              label="Go to Inventory"
              to="/inventory"
              class="q-mt-sm"
            />
          </div>

          <div v-else class="trade-wizard__grid">
            <YugiohCard
              v-for="card in tradeStore.myCards"
              :key="card.id"
              variant="inventory"
              :title="card.name"
              :image-url="card.imageUrl"
              :rarity-label="getRarityLabel(card)"
              :rarity-variant="getRarityVariant(card)"
              :selected="tradeStore.selectedOfferingId === card.id"
              :interactive="true"
              @click="selectOffering(card.id)"
            />
          </div>
        </div>

        <!-- Center: divider + arrow -->
        <div class="trade-wizard__divider-col">
          <div class="trade-wizard__divider-line" aria-hidden="true" />
          <div class="trade-wizard__divider-arrow">
            <q-icon name="arrow_forward" size="28px" />
          </div>
        </div>

        <!-- Right: Desired Card -->
        <div class="trade-wizard__column">
          <div class="trade-wizard__column-header">
            <span class="trade-wizard__step-badge">2</span>
            <span class="dt-heading-orbitron trade-wizard__column-title">Desired Card</span>
          </div>

          <q-input
            v-model="catalogSearch"
            dense
            outlined
            borderless
            class="trade-wizard__search"
            placeholder="Search global database..."
            debounce="200"
          >
            <template #prepend>
              <q-icon name="search" size="20px" />
            </template>
          </q-input>

          <q-inner-loading :showing="tradeStore.isLoadingCatalog">
            <q-spinner-gears color="primary" size="48px" />
          </q-inner-loading>

          <div v-if="!tradeStore.isLoadingCatalog" class="trade-wizard__grid">
            <YugiohCard
              v-for="card in filteredCatalog"
              :key="card.id"
              variant="inventory"
              :title="card.name"
              :image-url="card.imageUrl"
              :rarity-label="getRarityLabel(card)"
              :rarity-variant="getRarityVariant(card)"
              :selected="tradeStore.selectedReceivingId === card.id"
              :interactive="true"
              @click="selectReceiving(card.id)"
            />
          </div>

          <div
            v-if="tradeStore.catalogMore && !tradeStore.isLoadingCatalog"
            class="row justify-center q-mt-md"
          >
            <q-btn
              flat
              color="primary"
              no-caps
              :loading="loadingMore"
              label="Load more"
              @click="loadMore"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Footer: info + dynamic button -->
    <footer class="trade-page__footer">
      <div class="trade-page__info dt-glass-surface--soft">
        <q-icon name="info" size="20px" class="trade-page__info-icon" />
        <span class="dt-text-muted text-caption">
          By initiating this trade, your tribute card will be locked until the trade is accepted or
          cancelled.
        </span>
      </div>
      <q-btn
        class="trade-page__cta"
        no-caps
        unelevated
        :label="actionButtonLabel"
        :disable="!tradeStore.canSubmit"
        :loading="tradeStore.isSubmitting"
        @click="handleSubmit"
      />
    </footer>

    <q-banner v-if="tradeStore.errorMessage" rounded dense class="bg-negative text-white q-mt-md">
      {{ tradeStore.errorMessage }}
    </q-banner>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import YugiohCard from 'src/shared/components/YugiohCard.vue';
import type { Card } from 'src/core/types/api';
import { useAuthStore } from 'src/modules/auth/store/auth.store';
import { useTradeStore } from '../store/trade.store';

const router = useRouter();
const authStore = useAuthStore();
const tradeStore = useTradeStore();

const catalogSearch = ref('');
const loadingMore = ref(false);

type YugiohRarity = 'common' | 'rare' | 'super-rare' | 'ultra-rare' | 'secret-rare';

const RARITY_OPTIONS: { label: string; variant: YugiohRarity }[] = [
  { label: 'ULTRA RARE', variant: 'ultra-rare' },
  { label: 'SECRET RARE', variant: 'secret-rare' },
  { label: 'SUPER RARE', variant: 'super-rare' },
  { label: 'COMMON', variant: 'common' },
];

function getRarityLabel(card: Card): string {
  const idx = card.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % RARITY_OPTIONS.length;
  return RARITY_OPTIONS[idx]?.label ?? 'COMMON';
}

function getRarityVariant(card: Card): YugiohRarity {
  const idx = card.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % RARITY_OPTIONS.length;
  return RARITY_OPTIONS[idx]?.variant ?? 'common';
}

const filteredCatalog = computed(() => {
  const q = catalogSearch.value.toLowerCase().trim();
  if (!q) return tradeStore.catalogCards;
  return tradeStore.catalogCards.filter((c) => c.name.toLowerCase().includes(q));
});

const actionButtonLabel = computed(() => (tradeStore.canSubmit ? 'CREATE TRADE' : 'SELECT CARDS'));

onMounted(async () => {
  if (!authStore.user && authStore.token) {
    await authStore.hydrateFromToken();
  }
  if (!authStore.isAuthenticated) {
    await router.replace('/auth');
    return;
  }
  await tradeStore.loadMyCards();
  await tradeStore.loadCatalog(true);
});

function selectOffering(cardId: string): void {
  tradeStore.setSelectedOffering(tradeStore.selectedOfferingId === cardId ? null : cardId);
}

function selectReceiving(cardId: string): void {
  tradeStore.setSelectedReceiving(tradeStore.selectedReceivingId === cardId ? null : cardId);
}

async function loadMore(): Promise<void> {
  loadingMore.value = true;
  try {
    await tradeStore.loadMoreCatalog();
  } finally {
    loadingMore.value = false;
  }
}

async function handleSubmit(): Promise<void> {
  const tradeId = await tradeStore.submitTrade();
  if (tradeId) {
    await router.replace('/active-trades');
  }
}
</script>

<style lang="scss" scoped>
.trade-page {
  padding: 24px 20px 40px;
}

.trade-page__header {
  margin-bottom: 28px;
}

.trade-page__title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.1em;
}

.trade-page__subtitle {
  font-size: 0.95rem;
  max-width: 520px;
  margin: 0;
  line-height: 1.5;
}

.trade-wizard {
  border-radius: 18px;
  padding: 24px;
  min-height: 360px;
}

.trade-wizard__columns {
  display: flex;
  gap: 24px;
  align-items: stretch;
}

@media (max-width: 900px) {
  .trade-wizard__columns {
    flex-direction: column;
  }

  .trade-wizard__divider-col {
    flex-direction: row !important;
    width: 100%;
  }

  .trade-wizard__divider-line {
    width: 100%;
    height: 1px !important;
  }

  .trade-wizard__divider-arrow {
    transform: rotate(90deg);
  }
}

.trade-wizard__column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trade-wizard__column-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.trade-wizard__step-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid var(--dt-color-millennium-gold);
  color: var(--dt-color-millennium-gold);
  font-family: 'Orbitron', system-ui, sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
}

.trade-wizard__column-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--dt-color-millennium-gold);
  letter-spacing: 0.08em;
}

.trade-wizard__search {
  border-radius: 8px;
  background: var(--dt-color-surface-soft);
  border: 1px solid var(--dt-color-border-glass);
}

.trade-wizard__search :deep(.q-field__control) {
  color: var(--dt-text-primary);
}

.trade-wizard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.trade-wizard__empty {
  min-height: 180px;
  padding: 24px;
}

.trade-wizard__divider-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  width: 40px;
}

.trade-wizard__divider-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(255, 215, 0, 0.4),
    rgba(255, 215, 0, 0.4),
    transparent
  );
}

.trade-wizard__divider-arrow {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 215, 0, 0.12);
  border: 1px solid rgba(255, 215, 0, 0.4);
  color: var(--dt-color-millennium-gold);
}

.trade-page__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.trade-page__info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  max-width: 480px;
}

.trade-page__info-icon {
  color: var(--dt-color-cyber-blue);
  flex-shrink: 0;
}

.trade-page__cta.q-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.trade-page__cta.q-btn:not(:disabled) {
  background: var(--dt-color-cyber-blue);
  color: var(--dt-color-deep-navy);
}

.trade-page__cta.q-btn:disabled {
  background: var(--dt-color-surface-soft);
  color: var(--dt-text-muted);
}
</style>
