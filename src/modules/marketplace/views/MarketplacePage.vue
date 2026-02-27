<template>
  <q-page class="q-pa-none">
    <section class="dt-hero-bg q-px-lg q-py-xl">
      <div class="row items-center justify-between q-gutter-xl">
        <div class="column q-gutter-y-md">
          <div class="dt-heading-orbitron text-h4 text-weight-bold">
            <span class="dt-glow-text-cyan">The Global Duelist</span>
            <span class="q-ml-xs dt-glow-text-gold">Hub</span>
          </div>
          <div class="dt-text-muted text-body2" style="max-width: 460px">
            Exchange your rarest cards in a secure, holographic marketplace. Connect
            with duelists worldwide and perfect your deck.
          </div>
          <div class="row items-center q-gutter-md">
            <q-btn
              color="secondary"
              text-color="dark"
              rounded
              no-caps
              class="dt-holo-glow"
              label="Join Duelist Hub"
              to="/auth"
            />
            <div class="row items-center q-gutter-xs text-caption dt-text-muted">
              <q-icon name="lens" size="10px" color="primary" />
              <span>{{ activeTradesLabel }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="q-px-lg q-pb-xl q-pt-lg">
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <q-badge color="secondary" text-color="dark" class="q-py-md" />
          <div class="dt-heading-orbitron text-subtitle1">Live Marketplace</div>
          <q-badge color="secondary" text-color="dark" class="q-ml-sm">
            {{ tradesCountLabel }}
          </q-badge>
        </div>

        <q-select
          v-model="sortOption"
          dense
          outlined
          borderless
          options-dense
          :options="sortOptions"
          emit-value
          map-options
          class="bg-transparent text-caption"
        />
      </div>

      <q-inner-loading :showing="marketplaceStore.isLoading">
        <q-spinner-gears color="secondary" size="64px" />
      </q-inner-loading>

      <div v-if="!marketplaceStore.isLoading && !sortedTrades.length" class="q-mt-xl">
        <div
          class="dt-glass-surface dt-holo-border q-pa-xl flex flex-center text-center"
        >
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
        <q-card
          v-for="trade in sortedTrades"
          :key="trade.id"
          flat
          bordered
          class="dt-glass-surface dt-holo-border marketplace-card"
        >
          <q-card-section class="q-pb-sm">
            <div class="row items-center justify-between q-gutter-sm">
              <div class="row items-center q-gutter-sm">
                <q-avatar size="32px" color="secondary" text-color="dark">
                  {{ trade.user.name.charAt(0).toUpperCase() }}
                </q-avatar>
                <div class="column">
                  <div class="text-body2 text-weight-medium">
                    {{ trade.user.name }}
                  </div>
                  <div class="dt-text-muted text-caption">
                    {{ formatRelativeTime(trade.createdAt) }}
                  </div>
                </div>
              </div>

              <q-badge outline color="secondary" text-color="secondary">
                {{ trade.tradeCards.length }} cards linked
              </q-badge>
            </div>
          </q-card-section>

          <q-separator dark />

          <q-card-section class="q-pt-md">
            <div class="row items-stretch q-gutter-md">
              <div class="column col-5 q-gutter-y-xs">
                <div class="text-caption text-uppercase text-grey-4">Offering</div>
                <div class="row q-col-gutter-sm">
                  <div
                    v-for="card in offeringForTrade(trade.id)"
                    :key="card.id"
                    class="col-12"
                  >
                    <YugiohCard
                      :title="card.name"
                      :image-url="card.imageUrl"
                      :description="card.description"
                      rarity-label="Offering"
                      rarity-variant="ultra-rare"
                    />
                  </div>
                </div>
              </div>

              <div class="column col-auto flex flex-center">
                <q-icon name="arrow_forward" size="36px" color="primary" />
              </div>

              <div class="column col-5 q-gutter-y-xs">
                <div class="text-caption text-uppercase text-grey-4">
                  Requesting
                </div>
                <div class="row q-col-gutter-sm">
                  <div
                    v-for="card in requestingForTrade(trade.id)"
                    :key="card.id"
                    class="col-12"
                  >
                    <YugiohCard
                      :title="card.name"
                      :image-url="card.imageUrl"
                      :description="card.description"
                      rarity-label="Requested"
                      rarity-variant="secret-rare"
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pt-none q-pb-md q-px-md">
            <q-btn
              color="secondary"
              text-color="dark"
              no-caps
              rounded
              label="Initiate Trade"
              to="/trade"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div
        v-if="marketplaceStore.more && sortedTrades.length"
        class="row justify-center q-mt-lg"
      >
        <q-btn
          flat
          color="primary"
          no-caps
          :loading="marketplaceStore.isLoadingMore"
          label="Load more"
          @click="marketplaceStore.loadNextPage()"
        />
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import YugiohCard from 'src/shared/components/YugiohCard.vue';
import type { Card, TradeCard, TradeListItem } from 'src/core/types/api';
import { useMarketplaceStore } from '../store/marketplace.store';

const marketplaceStore = useMarketplaceStore();

type SortOptionValue = 'newest' | 'oldest';

interface SortOption {
  label: string;
  value: SortOptionValue;
}

const sortOptions: SortOption[] = [
  { label: 'Sort by Newest', value: 'newest' },
  { label: 'Sort by Oldest', value: 'oldest' },
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

const tradesCountLabel = computed(
  () => `${marketplaceStore.trades.length} active trades`,
);

const activeTradesLabel = computed(
  () => `${marketplaceStore.trades.length} active trades`,
);

onMounted(async () => {
  await marketplaceStore.loadFirstPage();
});

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

function offeringForTrade(tradeId: string): Card[] {
  return extractCardsByType(tradeId, 'OFFERING');
}

function requestingForTrade(tradeId: string): Card[] {
  return extractCardsByType(tradeId, 'RECEIVING');
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

<style scoped>
.marketplace-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.marketplace-card {
  height: 100%;
}
</style>

