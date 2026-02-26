<template>
  <q-page class="q-pa-lg">
    <div class="column q-gutter-y-lg">
      <header class="column q-gutter-y-xs">
        <h1 class="dt-heading-orbitron text-h4 text-weight-bold q-ma-none dt-glow-text-cyan">
          Active Trades
        </h1>
        <p class="dt-text-muted text-body2 q-ma-none">
          Manage your published trade offers and incoming requests.
        </p>
      </header>

      <q-inner-loading :showing="activeTradesStore.isLoading">
        <q-spinner-gears color="secondary" size="64px" />
      </q-inner-loading>

      <div
        v-if="!activeTradesStore.isLoading && !activeTradesStore.trades.length"
        class="dt-glass-surface dt-holo-border q-pa-xl flex flex-center text-center"
      >
        <div class="column items-center q-gutter-y-sm">
          <q-icon name="swap_horiz" size="40px" color="primary" />
          <div class="text-subtitle2">No active trades</div>
          <div class="dt-text-muted text-caption">
            Create a trade from the Trade Portal to see it here.
          </div>
          <q-btn
            color="secondary"
            text-color="dark"
            no-caps
            rounded
            label="Trade Portal"
            to="/trade"
          />
        </div>
      </div>

      <div v-else class="active-trades-list column q-gutter-md">
        <q-card
          v-for="trade in activeTradesStore.trades"
          :key="trade.id"
          flat
          bordered
          class="dt-glass-surface dt-holo-border active-trade-card"
        >
          <q-card-section>
            <div class="row items-stretch q-gutter-lg">
              <div class="column col-grow q-gutter-y-xs">
                <div class="text-caption text-uppercase text-grey-4">Offering</div>
                <div class="row q-col-gutter-sm">
                  <div
                    v-for="card in offeringCards(trade)"
                    :key="card.id"
                    class="col-12 col-sm-6"
                  >
                    <YugiohCard
                      :title="card.name"
                      :image-url="card.imageUrl"
                      :description="card.description"
                      rarity-label="ULTRA RARE"
                      rarity-variant="ultra-rare"
                      :interactive="false"
                    />
                  </div>
                </div>
              </div>
              <div class="column col-auto flex flex-center">
                <span class="dt-heading-orbitron text-caption text-primary">FOR</span>
              </div>
              <div class="column col-grow q-gutter-y-xs">
                <div class="text-caption text-uppercase text-grey-4">Requesting</div>
                <div class="row q-col-gutter-sm">
                  <div
                    v-for="card in requestingCards(trade)"
                    :key="card.id"
                    class="col-12 col-sm-6"
                  >
                    <YugiohCard
                      :title="card.name"
                      :image-url="card.imageUrl"
                      :description="card.description"
                      rarity-label="SECRET RARE"
                      rarity-variant="secret-rare"
                      :interactive="false"
                    />
                  </div>
                </div>
              </div>
              <div class="column col-auto active-trade-actions">
                <div class="column q-gutter-y-sm">
                  <div class="text-caption text-uppercase text-grey-4">Status</div>
                  <div class="row items-center q-gutter-xs">
                    <q-badge rounded color="positive" />
                    <span class="text-caption">Awaiting Responses</span>
                  </div>
                  <q-btn
                    color="negative"
                    no-caps
                    rounded
                    outline
                    icon="delete"
                    label="Revoke Offer"
                    :loading="activeTradesStore.isDeletingId === trade.id"
                    :disable="activeTradesStore.isDeletingId !== null"
                    @click="openRevokeModal(trade.id)"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <q-banner v-if="activeTradesStore.errorMessage" rounded dense class="bg-negative text-white">
        {{ activeTradesStore.errorMessage }}
      </q-banner>
    </div>

    <!-- Glassmorphism confirmation modal -->
    <q-dialog v-model="revokeModalOpen" persistent>
      <q-card class="dt-glass-surface dt-holo-border revoke-modal-card">
        <q-card-section>
          <div class="row items-center q-gutter-sm q-mb-md">
            <q-icon name="warning" size="28px" color="negative" />
            <span class="text-h6">Revoke this trade?</span>
          </div>
          <p class="dt-text-muted text-body2 q-ma-none">
            This will cancel your trade offer. The offered card will be unlocked
            and returned to your inventory.
          </p>
        </q-card-section>
        <q-card-actions align="right" class="q-pt-none">
          <q-btn flat no-caps label="Cancel" color="primary" @click="revokeModalOpen = false" />
          <q-btn
            unelevated
            no-caps
            label="Revoke Offer"
            color="negative"
            :loading="activeTradesStore.isDeletingId !== null"
            @click="confirmRevoke"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import YugiohCard from 'src/shared/components/YugiohCard.vue';
import type { Card, TradeListItem } from 'src/core/types/api';
import { useAuthStore } from 'src/modules/auth/store/auth.store';
import { useActiveTradesStore } from '../store/activeTrades.store';

const router = useRouter();
const authStore = useAuthStore();
const activeTradesStore = useActiveTradesStore();

const revokeModalOpen = ref(false);
const tradeToRevokeId = ref<string | null>(null);

function offeringCards(trade: TradeListItem): Card[] {
  return trade.tradeCards
    .filter((tc) => tc.type === 'OFFERING')
    .map((tc) => tc.card);
}

function requestingCards(trade: TradeListItem): Card[] {
  return trade.tradeCards
    .filter((tc) => tc.type === 'RECEIVING')
    .map((tc) => tc.card);
}

function openRevokeModal(tradeId: string): void {
  tradeToRevokeId.value = tradeId;
  revokeModalOpen.value = true;
}

async function confirmRevoke(): Promise<void> {
  const id = tradeToRevokeId.value;
  if (!id) return;
  await activeTradesStore.revokeTrade(id);
  revokeModalOpen.value = false;
  tradeToRevokeId.value = null;
}

onMounted(async () => {
  if (!authStore.user && authStore.token) {
    await authStore.hydrateFromToken();
  }
  if (!authStore.isAuthenticated) {
    await router.replace('/auth');
    return;
  }
  if (authStore.user) {
    await activeTradesStore.loadMyTrades(authStore.user.id);
  }
});
</script>

<style scoped>
.active-trade-card {
  width: 100%;
}

.active-trade-actions {
  min-width: 140px;
}

.revoke-modal-card {
  min-width: 360px;
  max-width: 90vw;
}
</style>
