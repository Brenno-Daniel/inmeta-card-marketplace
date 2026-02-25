<template>
  <q-page class="q-pa-lg">
    <div class="column q-gutter-y-lg">
      <header class="column q-gutter-y-xs">
        <h1 class="dt-heading-orbitron text-h4 text-weight-bold q-ma-none dt-glow-text-cyan">
          Create Trade Offer
        </h1>
        <p class="dt-text-muted text-body2 q-ma-none">
          Select a card from your inventory to offer as tribute, and choose the
          card you desire from the global database.
        </p>
      </header>

      <div class="trade-wizard dt-glass-surface dt-holo-border q-pa-lg">
        <div class="row q-col-gutter-lg">
          <!-- Left: Your Tribute -->
          <div class="col-12 col-md-5 column q-gutter-y-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="28px" color="positive" text-color="white" font-size="14px">
                1
              </q-avatar>
              <span class="dt-heading-orbitron text-subtitle1">Your Tribute</span>
            </div>

            <q-inner-loading :showing="tradeStore.isLoadingMyCards">
              <q-spinner-gears color="secondary" size="48px" />
            </q-inner-loading>

            <div
              v-if="!tradeStore.isLoadingMyCards && !tradeStore.myCards.length"
              class="trade-empty column items-center justify-center q-pa-xl dt-text-muted"
            >
              <q-icon name="inventory_2" size="40px" />
              <span class="text-caption">No cards in your vault.</span>
              <q-btn flat no-caps color="primary" label="Go to Inventory" to="/inventory" />
            </div>

            <div v-else class="trade-card-grid">
              <YugiohCard
                v-for="card in tradeStore.myCards"
                :key="card.id"
                :title="card.name"
                :image-url="card.imageUrl"
                :description="card.description"
                rarity-label="ULTRA RARE"
                rarity-variant="ultra-rare"
                :selected="tradeStore.selectedOfferingId === card.id"
                @click="selectOffering(card.id)"
              />
            </div>
          </div>

          <!-- Center: divider -->
          <div class="col-12 col-md-2 flex flex-center trade-divider-col">
            <div class="trade-divider" />
            <q-icon name="arrow_forward" size="32px" color="primary" class="trade-arrow" />
          </div>

          <!-- Right: Desired Card -->
          <div class="col-12 col-md-5 column q-gutter-y-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="28px" color="secondary" text-color="dark" font-size="14px">
                2
              </q-avatar>
              <span class="dt-heading-orbitron text-subtitle1">Desired Card</span>
            </div>

            <q-input
              v-model="catalogSearch"
              dense
              standout="bg-transparent"
              bg-color="transparent"
              color="primary"
              class="dt-input-glow"
              placeholder="Search global database..."
              debounce="200"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-inner-loading :showing="tradeStore.isLoadingCatalog">
              <q-spinner-gears color="secondary" size="48px" />
            </q-inner-loading>

            <div v-if="!tradeStore.isLoadingCatalog" class="trade-card-grid">
              <YugiohCard
                v-for="card in filteredCatalog"
                :key="card.id"
                :title="card.name"
                :image-url="card.imageUrl"
                :description="card.description"
                rarity-label="SUPER RARE"
                rarity-variant="super-rare"
                :selected="tradeStore.selectedReceivingId === card.id"
                @click="selectReceiving(card.id)"
              />
            </div>

            <div
              v-if="tradeStore.catalogMore && !tradeStore.isLoadingCatalog"
              class="row justify-center"
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

      <!-- Footer: warning + submit -->
      <div class="row items-center justify-between q-gutter-md trade-footer">
        <div class="row items-center q-gutter-sm dt-glass-surface--soft q-pa-sm rounded-borders">
          <q-icon name="info" color="primary" size="20px" />
          <span class="dt-text-muted text-caption">
            By initiating this trade, your tribute card will be locked until the
            trade is accepted or cancelled.
          </span>
        </div>
        <q-btn
          color="primary"
          no-caps
          rounded
          unelevated
          class="dt-holo-glow"
          label="Create Trade"
          :disable="!tradeStore.canSubmit"
          :loading="tradeStore.isSubmitting"
          @click="handleSubmit"
        />
      </div>

      <q-banner v-if="tradeStore.errorMessage" rounded dense class="bg-negative text-white">
        {{ tradeStore.errorMessage }}
      </q-banner>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import YugiohCard from 'src/shared/components/YugiohCard.vue';
import { useAuthStore } from 'src/modules/auth/store/auth.store';
import { useTradeStore } from '../store/trade.store';

const router = useRouter();
const authStore = useAuthStore();
const tradeStore = useTradeStore();

const catalogSearch = ref('');
const loadingMore = ref(false);

const filteredCatalog = computed(() => {
  const q = catalogSearch.value.toLowerCase().trim();
  if (!q) return tradeStore.catalogCards;
  return tradeStore.catalogCards.filter((c) =>
    c.name.toLowerCase().includes(q),
  );
});

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
  tradeStore.setSelectedOffering(
    tradeStore.selectedOfferingId === cardId ? null : cardId,
  );
}

function selectReceiving(cardId: string): void {
  tradeStore.setSelectedReceiving(
    tradeStore.selectedReceivingId === cardId ? null : cardId,
  );
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

<style scoped>
.trade-wizard {
  min-height: 320px;
}

.trade-divider-col {
  position: relative;
}

.trade-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(0, 242, 255, 0.4),
    rgba(255, 215, 0, 0.3),
    transparent
  );
}

.trade-arrow {
  position: relative;
  z-index: 1;
}

.trade-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.trade-empty {
  min-height: 160px;
}

.trade-footer {
  flex-wrap: wrap;
}
</style>
