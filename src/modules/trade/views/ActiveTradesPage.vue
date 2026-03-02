<template>
  <q-page class="active-trades-page">
    <header class="active-trades-page__header text-center">
      <h1 class="dt-heading-orbitron active-trades-page__title dt-glow-text-cyan">Active Trades</h1>
      <p class="active-trades-page__subtitle dt-text-muted">
        Manage your published trade offers and incoming requests.
      </p>
    </header>

    <q-inner-loading :showing="activeTradesStore.isLoading" dark>
      <q-spinner-gears color="primary" size="64px" />
    </q-inner-loading>

    <div
      v-if="!activeTradesStore.isLoading && !activeTradesStore.trades.length"
      class="active-trades-empty dt-glass-surface dt-holo-border"
    >
      <div class="column items-center q-gutter-y-sm text-center">
        <q-icon name="swap_horiz" size="40px" color="primary" />
        <div class="text-subtitle2">No active trades</div>
        <div class="dt-text-muted text-caption">
          Create a trade from the Trade Portal to see it here.
        </div>
        <q-btn
          class="active-trades-empty__cta"
          no-caps
          unelevated
          label="Trade Portal"
          to="/trade"
        />
      </div>
    </div>

    <div v-else class="active-trades-list">
      <article
        v-for="trade in activeTradesStore.trades"
        :key="trade.id"
        class="active-trade-card dt-glass-surface dt-holo-border"
      >
        <div class="active-trade-card__content">
          <!-- Offering card -->
          <div class="active-trade-card__slot">
            <YugiohCard
              v-if="firstOffering(trade)"
              variant="compact"
              :title="firstOffering(trade)!.name"
              :image-url="firstOffering(trade)!.imageUrl"
              rarity-label="ULTRA RARE"
              rarity-variant="ultra-rare"
            />
            <div v-else class="active-trade-card__empty">—</div>
          </div>

          <!-- FOR divider -->
          <div class="active-trade-card__for">FOR</div>

          <!-- Requesting card -->
          <div class="active-trade-card__slot">
            <YugiohCard
              v-if="firstRequesting(trade)"
              variant="compact"
              :title="firstRequesting(trade)!.name"
              :image-url="firstRequesting(trade)!.imageUrl"
              rarity-label="SECRET RARE"
              rarity-variant="secret-rare"
            />
            <div v-else class="active-trade-card__empty">—</div>
          </div>

          <!-- Status + Revoke -->
          <div class="active-trade-card__meta">
            <div class="active-trade-card__status">
              <span class="active-trade-card__status-label">STATUS</span>
              <div class="active-trade-card__status-value row items-center no-wrap">
                <span class="active-trade-card__status-dot" aria-hidden="true" />
                <span>Awaiting Responses</span>
              </div>
            </div>
            <div class="active-trade-card__offers">
              <span class="active-trade-card__offers-label">Offers:</span>
              <span class="active-trade-card__offers-count">0</span>
            </div>
            <q-btn
              class="active-trade-card__revoke"
              no-caps
              flat
              unelevated
              icon="delete"
              label="Revoke Offer"
              :loading="activeTradesStore.isDeletingId === trade.id"
              :disable="activeTradesStore.isDeletingId !== null"
              @click="openRevokeModal(trade.id)"
            />
          </div>
        </div>
      </article>
    </div>

    <q-banner
      v-if="activeTradesStore.errorMessage"
      rounded
      dense
      class="bg-negative text-white q-mt-md"
    >
      {{ activeTradesStore.errorMessage }}
    </q-banner>

    <!-- Revoke Modal (glassmorphism) -->
    <q-dialog v-model="revokeModalOpen" persistent>
      <q-card class="revoke-modal dt-glass-surface">
        <q-card-section class="revoke-modal__header">
          <div class="row items-center no-wrap">
            <q-icon name="warning" size="28px" class="revoke-modal__icon" />
            <span class="dt-heading-orbitron revoke-modal__title">Confirm Revocation</span>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="revoke-modal__close"
            aria-label="Close"
            @click="closeRevokeModal"
          />
        </q-card-section>

        <q-card-section class="revoke-modal__body">
          <p class="revoke-modal__message">
            Are you sure you want to cancel this trade offer? Your tribute card will be returned to
            your inventory.
          </p>
        </q-card-section>

        <q-card-actions align="right" class="revoke-modal__actions">
          <q-btn
            flat
            no-caps
            class="revoke-modal__btn-keep"
            label="Keep Active"
            @click="closeRevokeModal"
          />
          <q-btn
            unelevated
            no-caps
            class="revoke-modal__btn-revoke"
            label="Confirm Revoke"
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

function firstOffering(trade: TradeListItem): Card | undefined {
  return trade.tradeCards.filter((tc) => tc.type === 'OFFERING').map((tc) => tc.card)[0];
}

function firstRequesting(trade: TradeListItem): Card | undefined {
  return trade.tradeCards.filter((tc) => tc.type === 'RECEIVING').map((tc) => tc.card)[0];
}

function openRevokeModal(tradeId: string): void {
  tradeToRevokeId.value = tradeId;
  revokeModalOpen.value = true;
}

function closeRevokeModal(): void {
  revokeModalOpen.value = false;
  tradeToRevokeId.value = null;
}

async function confirmRevoke(): Promise<void> {
  const id = tradeToRevokeId.value;
  if (!id) return;
  await activeTradesStore.revokeTrade(id);
  closeRevokeModal();
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

<style lang="scss" scoped>
.active-trades-page {
  padding: 24px 20px 40px;
}

.active-trades-page__header {
  margin-bottom: 24px;
}

.active-trades-page__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--dt-text-primary);
  margin: 0 0 8px;
  letter-spacing: 0.1em;
}

.active-trades-page__subtitle {
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
}

.active-trades-empty {
  border-radius: 18px;
  padding: 48px 24px;
}

.active-trades-empty__cta {
  margin-top: 8px;
  background: var(--dt-color-millennium-gold);
  color: var(--dt-color-deep-navy);
  font-weight: 600;
  border-radius: 8px;
}

.active-trades-empty__cta:hover {
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.2);
}

.active-trades-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.active-trade-card {
  border-radius: 18px;
  overflow: hidden;
  padding: 24px;
}

.active-trade-card__content {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.active-trade-card__slot {
  display: grid;
  grid-template-columns: repeat(auto-fill, max(160px));
  gap: 20px;
}

.active-trade-card__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  color: var(--dt-text-muted);
  font-size: 1rem;
  border: 1px dashed var(--dt-color-border-glass);
  border-radius: 12px;
}

.active-trade-card__for {
  font-family: 'Orbitron', system-ui, sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--dt-text-muted);
  letter-spacing: 0.1em;
  flex-shrink: 0;
}

.active-trade-card__meta {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 160px;
}

@media (max-width: 600px) {
  .active-trade-card__for {
    text-align: center;
  }
}

@media (max-width: 735px) {
  .active-trade-card__meta {
    margin-left: 0;
    margin-top: 8px;
    padding-top: 16px;
    border-top: 1px solid var(--dt-color-border-glass);
    flex-direction: row;
    width: 100%;
    justify-content: center;
  }

  .active-trade-card__content {
    justify-content: center;
  }
}

@media (max-width: 512px) {
  .active-trade-card__content {
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

.active-trade-card__status {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.active-trade-card__status-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--dt-text-muted);
}

.active-trade-card__status-value {
  font-size: 0.9rem;
  color: var(--dt-text-primary);
  gap: 8px;
}

.active-trade-card__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dt-color-cyber-blue);
  box-shadow: 0 0 8px rgba(0, 242, 255, 0.6);
  flex-shrink: 0;
}

.active-trade-card__offers {
  display: flex;
  align-items: center;
  gap: 8px;
}

.active-trade-card__offers-label {
  font-size: 0.85rem;
  color: var(--dt-text-muted);
}

.active-trade-card__offers-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 2px 8px;
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--dt-color-surface-soft);
  border-radius: 6px;
  color: var(--dt-text-primary);
}

.active-trade-card__revoke.q-btn {
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(220, 38, 38, 0.5);
  color: #f87171;
  border-radius: 8px;
  font-weight: 600;
}

.active-trade-card__revoke.q-btn:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.25);
  border-color: #f87171;
}

/* Revoke Modal - glassmorphism */
.revoke-modal {
  min-width: 400px;
  max-width: 90vw;
  border-radius: 16px;
  border: 1px solid rgba(220, 38, 38, 0.2);
  background: linear-gradient(
    145deg,
    rgba(29, 17, 53, 0.98),
    rgba(55, 20, 60, 0.95),
    rgba(30, 15, 45, 0.98)
  );
  box-shadow:
    0 0 0 1px rgba(220, 38, 38, 0.15),
    0 24px 48px rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(24px) saturate(1.3);
}

.revoke-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--dt-color-border-glass);
}

.revoke-modal__icon {
  color: #f87171;
  margin-right: 12px;
}

.revoke-modal__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f87171;
  letter-spacing: 0.08em;
}

.revoke-modal__close {
  color: var(--dt-text-muted);
}

.revoke-modal__body {
  padding-top: 20px;
  padding-bottom: 20px;
}

.revoke-modal__message {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--dt-text-primary);
}

.revoke-modal__actions {
  padding-top: 0;
  gap: 12px;
}

.revoke-modal__btn-keep.q-btn {
  background: var(--dt-color-surface-soft);
  border: 1px solid var(--dt-color-border-glass);
  color: var(--dt-text-primary);
  border-radius: 8px;
}

.revoke-modal__btn-revoke.q-btn {
  background: #dc2626;
  color: white;
  border-radius: 8px;
  font-weight: 600;
}

.revoke-modal__btn-revoke.q-btn:hover {
  background: #b91c1c;
}
</style>
