<template>
  <q-page class="q-pa-none">
    <!-- Hero Section -->
    <section class="dt-hero-bg hero-section">
      <div class="hero-section__content column items-center text-center q-gutter-y-md">
        <h1 class="dt-heading-orbitron hero-section__title text-weight-bold">
          <span class="dt-glow-text-gold">THE GLOBAL </span>
          <span class="dt-glow-text-cyan">DUELIST </span>
          <span class="dt-glow-text-gold">HUB</span>
        </h1>
        <p class="hero-section__subtitle">
          Exchange your rarest cards in a secure, holographic marketplace. Connect with duelists
          worldwide and perfect your deck.
        </p>
        <div class="hero-section__chip row items-center no-wrap">
          <span class="hero-section__chip-dot" aria-hidden="true" />
          <span class="hero-section__chip-text">{{ activeTradesChipLabel }}</span>
        </div>
      </div>
    </section>

    <!-- Live Marketplace -->
    <section class="marketplace-section">
      <div class="marketplace-section__header row items-center justify-between">
        <div class="row items-center no-wrap marketplace-section__title-wrap">
          <div class="marketplace-section__title-bar" aria-hidden="true" />
          <h2 class="dt-heading-orbitron marketplace-section__title">
            <span class="dt-glow-text-gold">Live</span>
            <span class="marketplace-section__title-suffix"> Marketplace</span>
          </h2>
        </div>

        <q-select
          v-model="sortOption"
          dense
          outlined
          borderless
          options-dense
          :options="sortOptions"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          dark
          class="marketplace-section__sort"
          behavior="menu"
          :display-value="sortByDisplayValue"
        />
      </div>

      <q-inner-loading :showing="marketplaceStore.isLoading" dark>
        <q-spinner-gears color="secondary" size="64px" />
      </q-inner-loading>

      <div v-if="!marketplaceStore.isLoading && !sortedTrades.length" class="q-mt-xl">
        <div class="dt-glass-surface dt-holo-border q-pa-xl flex flex-center text-center">
          <div class="column items-center q-gutter-y-sm">
            <q-icon name="visibility_off" size="40px" color="primary" />
            <div class="text-subtitle2">No trades published yet</div>
            <div class="dt-text-muted text-caption">
              Be the first to open a trade in the DuelTrade portal.
            </div>
          </div>
        </div>
      </div>

      <div v-else class="marketplace-grid q-mt-md">
        <article
          v-for="trade in sortedTrades"
          :key="trade.id"
          class="trade-card dt-glass-surface dt-holo-border"
        >
          <!-- Top: User avatar + name + time -->
          <header class="trade-card__header">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="36px" class="trade-card__avatar" color="primary" text-color="dark">
                {{ trade.user.name.charAt(0).toUpperCase() }}
              </q-avatar>
              <div class="column q-gutter-none">
                <span class="trade-card__username text-body2 text-weight-medium">
                  {{ trade.user.name }}
                </span>
                <span class="trade-card__time dt-text-muted text-caption">
                  {{ formatRelativeTime(trade.createdAt) }}
                </span>
              </div>
            </div>
            <span class="trade-card__linked dt-text-muted text-caption">
              {{ trade.tradeCards.length }} linked
            </span>
          </header>

          <!-- Middle: OFFERING | arrow | REQUESTING -->
          <div class="trade-card__body">
            <div class="trade-card__column trade-card__column--offering">
              <span class="trade-card__label trade-card__label--offering">OFFERING</span>
              <div class="trade-card__card-slot">
                <YugiohCard
                  v-if="firstOffering(trade)"
                  variant="compact"
                  :title="firstOffering(trade)!.name"
                  :image-url="firstOffering(trade)!.imageUrl"
                  rarity-label="ULTRA RARE"
                  rarity-variant="ultra-rare"
                />
                <div v-else class="trade-card__empty-slot">—</div>
              </div>
            </div>

            <div class="trade-card__arrow" aria-hidden="true">
              <q-icon name="arrow_forward" size="28px" />
            </div>

            <div class="trade-card__column trade-card__column--requesting">
              <span class="trade-card__label trade-card__label--requesting">REQUESTING</span>
              <div class="trade-card__card-slot">
                <YugiohCard
                  v-if="firstRequesting(trade)"
                  variant="compact"
                  :title="firstRequesting(trade)!.name"
                  :image-url="firstRequesting(trade)!.imageUrl"
                  rarity-label="SECRET RARE"
                  rarity-variant="secret-rare"
                />
                <div v-else class="trade-card__empty-slot">—</div>
              </div>
            </div>
          </div>

          <!-- Bottom: linked cards + Initiate Trade -->
          <footer class="trade-card__footer row items-center justify-between q-gutter-sm">
            <q-btn
              v-if="trade.tradeCards.length > 1"
              class="trade-card__linked-btn dt-text-millennium-gold dt-glow-text-gold"
              no-caps
              flat
              dense
              icon="collections"
              label="See all linked cards"
              @click="openLinkedCardsModal(trade.id)"
            />
            <div class="q-space" />
            <q-btn
              class="trade-card__cta"
              no-caps
              flat
              unelevated
              label="Show Interest"
              @click="handleInitiateTrade(trade)"
            />
          </footer>
        </article>
      </div>

      <div v-if="marketplaceStore.more && sortedTrades.length" class="row justify-center q-mt-lg">
        <q-btn
          class="load-more-btn"
          flat
          color="primary"
          no-caps
          :loading="marketplaceStore.isLoadingMore"
          label="Load more"
          @click="marketplaceStore.loadNextPage()"
        />
      </div>
    </section>

    <!-- Linked cards modal -->
    <q-dialog v-model="linkedModalOpen" full-width>
      <q-inner-loading :showing="marketplaceStore.isLoading" dark>
        <q-spinner-gears color="secondary" size="64px" />
      </q-inner-loading>

      <q-card class="linked-cards-modal dt-glass-surface">
        <q-card-section class="row items-center justify-between q-gutter-sm">
          <div class="column">
            <span class="dt-heading-orbitron linked-cards-modal__title">Linked Cards</span>
            <span v-if="modalTrade" class="linked-cards-modal__subtitle dt-text-muted">
              {{ modalTrade.user.name }} · {{ modalOfferingCards.length }} offering /
              {{ modalReceivingCards.length }} requesting
            </span>
          </div>
          <q-btn
            rounded
            dense
            flat
            icon="close"
            aria-label="Close"
            @click="closeLinkedCardsModal"
          />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-xl">
            <div class="col-12 col-sm-6">
              <div class="linked-cards-modal__column-header">Offering</div>
              <q-carousel
                v-if="modalOfferingCards.length"
                v-model="offeringSlide"
                swipeable
                animated
                infinite
                autoplay
                height="auto"
                control-color="primary"
                arrows
                class="dt-glass-surface"
              >
                <q-carousel-slide
                  v-for="card in modalOfferingCards"
                  :key="card.id"
                  :name="card.id"
                  class="column items-center justify-center"
                >
                  <div class="linked-cards-modal__card">
                    <YugiohCard
                      variant="compact"
                      :title="card.name"
                      :image-url="card.imageUrl"
                      rarity-label="ULTRA RARE"
                      rarity-variant="ultra-rare"
                    />
                  </div>
                </q-carousel-slide>
              </q-carousel>
              <div v-else class="linked-cards-modal__empty">No offering cards.</div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="linked-cards-modal__column-header">Requesting</div>
              <q-carousel
                v-if="modalReceivingCards.length"
                v-model="requestingSlide"
                swipeable
                animated
                infinite
                autoplay
                height="auto"
                control-color="secondary"
                arrows
                class="dt-glass-surface"
              >
                <q-carousel-slide
                  v-for="card in modalReceivingCards"
                  :key="card.id"
                  :name="card.id"
                  class="column items-center justify-center"
                >
                  <div class="linked-cards-modal__card">
                    <YugiohCard
                      variant="compact"
                      :title="card.name"
                      :image-url="card.imageUrl"
                      rarity-label="SECRET RARE"
                      rarity-variant="secret-rare"
                    />
                  </div>
                </q-carousel-slide>
              </q-carousel>
              <div v-else class="linked-cards-modal__empty">No requesting cards.</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Trade interest modal -->
    <q-dialog v-model="interestModalOpen">
      <q-card class="interest-modal dt-glass-surface">
        <q-card-section class="row items-center justify-between">
          <span class="dt-heading-orbitron interest-modal__title">Trade Interest Sent</span>
          <q-btn flat round dense icon="close" aria-label="Close" @click="closeInterestModal" />
        </q-card-section>
        <q-card-section>
          <p class="interest-modal__message">
            Interest request sent to
            <strong>{{ interestTargetName }}</strong
            >.
          </p>
          <p class="interest-modal__hint dt-text-muted">
            You can also create your own trade offer right now.
          </p>
        </q-card-section>
        <q-card-actions align="right" class="q-pt-none q-pb-md q-pr-lg">
          <q-btn flat no-caps label="Close" @click="closeInterestModal" />
          <q-btn
            unelevated
            no-caps
            color="primary"
            text-color="dark"
            label="Go to Trade Portal"
            @click="goToTradePortal"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import YugiohCard from 'src/shared/components/YugiohCard.vue';
import type { Card, TradeCard, TradeListItem } from 'src/core/types/api';
import { useAuthStore } from 'src/modules/auth/store/auth.store';
import { useMarketplaceStore } from '../store/marketplace.store';

const router = useRouter();
const authStore = useAuthStore();
const marketplaceStore = useMarketplaceStore();
const linkedModalOpen = ref(false);
const modalTradeId = ref<string | null>(null);
const offeringSlide = ref<string | null>(null);
const requestingSlide = ref<string | null>(null);
const interestModalOpen = ref(false);
const interestTargetName = ref<string>('');

type SortOptionValue = 'newest' | 'oldest';

interface SortOption {
  label: string;
  value: SortOptionValue;
}

const sortOptions: SortOption[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
];

const sortOption = ref<SortOptionValue>('newest');

const sortedTrades = computed<TradeListItem[]>(() => {
  const trades = [...marketplaceStore.trades];

  return trades.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();

    return sortOption.value === 'newest' ? timeB - timeA : timeA - timeB;
  });
});

const activeTradesChipLabel = computed(() => {
  const n = marketplaceStore.trades.length;
  return `${n.toLocaleString('en-US')} ACTIVE TRADES`;
});

const sortByDisplayValue = computed(
  () => `Sort by: ${sortOptions.find((o) => o.value === sortOption.value)?.label ?? 'Newest'}`,
);

const modalTrade = computed<TradeListItem | null>(() => {
  if (!modalTradeId.value) return null;
  return marketplaceStore.trades.find((t) => t.id === modalTradeId.value) ?? null;
});

const modalOfferingCards = computed<Card[]>(() =>
  modalTrade.value ? extractCardsByType(modalTrade.value.id, 'OFFERING') : [],
);

const modalReceivingCards = computed<Card[]>(() =>
  modalTrade.value ? extractCardsByType(modalTrade.value.id, 'RECEIVING') : [],
);

onMounted(async () => {
  await marketplaceStore.loadFirstPage();
});

async function openLinkedCardsModal(tradeId: string): Promise<void> {
  modalTradeId.value = tradeId;
  linkedModalOpen.value = true;
  await nextTick();

  const firstOffering = modalOfferingCards.value[0];
  const firstReceiving = modalReceivingCards.value[0];

  offeringSlide.value = firstOffering ? firstOffering.id : null;
  requestingSlide.value = firstReceiving ? firstReceiving.id : null;
}

function closeLinkedCardsModal(): void {
  linkedModalOpen.value = false;
  modalTradeId.value = null;
  offeringSlide.value = null;
  requestingSlide.value = null;
}

async function handleInitiateTrade(trade: TradeListItem): Promise<void> {
  if (!authStore.isAuthenticated) {
    await router.replace('/auth');
    return;
  }

  interestTargetName.value = trade.user.name;
  interestModalOpen.value = true;
}

function closeInterestModal(): void {
  interestModalOpen.value = false;
}

async function goToTradePortal(): Promise<void> {
  interestModalOpen.value = false;
  await router.push('/trade');
}

function formatRelativeTime(isoDate: string): string {
  const created = new Date(isoDate).getTime();
  const now = Date.now();
  const diffMs = now - created;

  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < minuteMs) {
    return 'Just now';
  }
  if (diffMs < hourMs) {
    const mins = Math.round(diffMs / minuteMs);
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }
  if (diffMs < dayMs) {
    const hours = Math.round(diffMs / hourMs);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.round(diffMs / dayMs);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function firstOffering(trade: TradeListItem): Card | undefined {
  return extractCardsByType(trade.id, 'OFFERING')[0];
}

function firstRequesting(trade: TradeListItem): Card | undefined {
  return extractCardsByType(trade.id, 'RECEIVING')[0];
}

function extractCardsByType(tradeId: string, type: TradeCard['type']): Card[] {
  const trade = marketplaceStore.trades.find((item) => item.id === tradeId);

  if (!trade) {
    return [];
  }

  return trade.tradeCards
    .filter((tradeCard) => tradeCard.type === type)
    .map((tradeCard) => tradeCard.card);
}
</script>

<style lang="scss" scoped>
/* Hero Section */
.hero-section {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.hero-section__content {
  max-width: 640px;
}

.hero-section__title {
  font-size: clamp(3.5rem, 4vw, 2.25rem);
  line-height: 1.2;
  letter-spacing: 0.14em;
  margin: 0;
}

.hero-section__subtitle {
  font-family: 'Rajdhani', system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--dt-text-primary);
  margin: 0;
  max-width: 480px;
}

.hero-section__chip {
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(11, 16, 32, 0.9);
  border: 1px solid var(--dt-color-border-glass);
  gap: 8px;
}

.hero-section__chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dt-color-cyber-blue);
  box-shadow: 0 0 8px rgba(0, 242, 255, 0.6);
}

.hero-section__chip-text {
  font-family: 'Rajdhani', system-ui, sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--dt-text-primary);
}

@media (max-width: 400px) {
  .hero-section__title {
    font-size: clamp(2.5rem, 4vw, 1.5rem);
  }

  .hero-section__subtitle {
    font-size: 0.9rem;
  }

  .hero-section__chip-text {
    font-size: 0.65rem;
  }

  .hero-section__chip-dot {
    width: 6px;
    height: 6px;
  }
}

/* Live Marketplace section */
.marketplace-section {
  padding: 24px 20px 40px;
}

.marketplace-section__header {
  margin-bottom: 20px;
}

.marketplace-section__title-wrap {
  gap: 12px;
  align-items: center;
}

.marketplace-section__title-bar {
  width: 4px;
  height: 28px;
  border-radius: 2px;
  background: var(--dt-color-millennium-gold);
}

.marketplace-section__title {
  font-size: 1.25rem;
  letter-spacing: 0.1em;
  margin: 0;
}

@media (max-width: 400px) {
  .marketplace-section__title {
    font-size: 1rem;
    letter-spacing: 0.01em;
  }
}

.marketplace-section__title-suffix {
  color: var(--dt-text-primary);
}

.marketplace-section__sort {
  max-width: 180px;
  border-radius: 8px;
  background: var(--dt-color-surface-soft);
  border: 1px solid var(--dt-color-border-glass);
}

.marketplace-section__sort :deep(.q-field__control),
.marketplace-section__sort :deep(.q-field__native),
.marketplace-section__sort :deep(.q-field__append) {
  color: var(--dt-color-cyber-blue);
  border-radius: 8px;
}

/* Trade card */
.marketplace-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.trade-card {
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.trade-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 8px;
}

.trade-card__avatar {
  border: 1px solid var(--dt-color-millennium-gold);
}

.trade-card__username {
  color: var(--dt-text-primary);
}

.trade-card__time {
  margin-top: 2px;
}

.trade-card__linked {
  font-size: 0.75rem;
}

.trade-card__body {
  display: flex;
  align-items: stretch;
  gap: 12px;
  margin-bottom: 16px;
  min-height: 0;
}

@media (max-width: 400px) {
  .trade-card__body {
    flex-direction: column;
    align-items: center;
  }

  .trade-card__column {
    max-width: 200px;
    width: 100%;
  }

  .trade-card__arrow {
    transform: rotate(90deg);
  }
}

.trade-card__column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trade-card__label {
  font-family: 'Orbitron', system-ui, sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.trade-card__label--offering {
  color: var(--dt-color-cyber-blue);
}

.trade-card__label--requesting {
  color: var(--dt-color-millennium-gold);
}

.trade-card__card-slot {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.trade-card__empty-slot {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dt-text-muted);
  font-size: 0.9rem;
  border: 1px dashed var(--dt-color-border-glass);
  border-radius: 10px;
}

.trade-card__arrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dt-color-cyber-blue);
}

.trade-card__footer {
  margin-top: auto;
}

.trade-card__linked-btn.q-btn {
  padding-left: 0;
}

.trade-card__cta.q-btn {
  width: 100%;
  border-radius: 10px;
  background: var(--dt-color-dark-purple);
  border: 1px solid var(--dt-color-millennium-gold);
  color: var(--dt-text-primary);
  font-weight: 600;
  letter-spacing: 0.04em;
}

.trade-card__cta.q-btn:hover {
  background: rgba(29, 17, 53, 0.9);
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.2);
}

.linked-cards-modal__card {
  width: 220px;
  max-width: 100%;
}

.linked-cards-modal__card :deep(.dt-yugioh-card--compact) {
  width: 100%;
}

.interest-modal {
  max-width: 480px;
}

.interest-modal__title {
  font-size: 1.05rem;
}

.interest-modal__message {
  margin-bottom: 8px;
}

.interest-modal__hint {
  font-size: 0.85rem;
}
</style>
