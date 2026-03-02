<template>
  <q-page class="inventory-page">
    <!-- Header: My Deck Box + user info + XP -->
    <header class="inventory-header">
      <div class="inventory-header__top">
        <h1 class="dt-heading-orbitron inventory-header__title dt-glow-text-cyan">My Deck Box</h1>
      </div>
      <div class="inventory-header__meta row items-center q-gutter-sm">
        <span class="inventory-header__meta-dot" aria-hidden="true" />
        <span class="inventory-header__meta-text">
          Level {{ duelistLevel }} Duelist • {{ inventoryStore.cardCount }} Cards in Vault
        </span>
      </div>
      <div class="inventory-header__xp">
        <div class="flex items-center justify-between">
          <span class="inventory-header__xp-label">XP PROGRESS</span>
          <span class="inventory-header__xp-text">
            {{ xpCurrent.toLocaleString() }} / {{ xpMax.toLocaleString() }}
          </span>
        </div>
        <div class="inventory-header__xp-bar-wrap">
          <q-linear-progress :value="xpProgress" class="inventory-header__xp-bar" size="5px" />
        </div>
      </div>
    </header>

    <!-- Controls: Search, Filter, Quick Add -->
    <div class="inventory-controls row items-center justify-between q-gutter-sm">
      <div class="row items-center q-gutter-sm no-wrap">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          borderless
          class="inventory-controls__search"
          placeholder="Search inventory..."
          debounce="200"
        >
          <template #prepend>
            <q-icon name="search" size="20px" />
          </template>
        </q-input>
      </div>
      <q-btn
        class="inventory-controls__quick-add"
        no-caps
        unelevated
        icon="add"
        label="Quick Add"
        @click="openQuickAdd"
      />
    </div>

    <!-- Card grid + Add Card slot -->
    <section class="inventory-section">
      <q-inner-loading :showing="inventoryStore.isLoading" dark>
        <q-spinner-gears color="primary" size="64px" />
      </q-inner-loading>

      <div
        v-if="!inventoryStore.isLoading && !filteredInventory.length"
        class="inventory-empty dt-glass-surface dt-holo-border"
      >
        <div class="column items-center q-gutter-y-sm text-center">
          <q-icon name="inventory_2" size="40px" color="primary" />
          <div class="text-subtitle2">Your vault is empty</div>
          <div class="dt-text-muted text-caption">
            Summon your first cards using the Quick Add terminal.
          </div>
          <q-btn
            class="inventory-empty__cta"
            no-caps
            unelevated
            icon="add"
            label="Quick Add"
            @click="openQuickAdd"
          />
        </div>
      </div>

      <div v-else class="inventory-grid">
        <YugiohCard
          v-for="card in filteredInventory"
          :key="card.id"
          variant="inventory"
          :title="card.name"
          :image-url="card.imageUrl"
          :rarity-label="getRarityLabel(card)"
          :rarity-variant="getRarityVariant(card)"
          :interactive="true"
          @click="() => {}"
        />
        <button
          v-if="filteredInventory.length"
          type="button"
          class="inventory-add-slot"
          aria-label="Add card"
          @click="openQuickAdd"
        >
          <q-icon name="add" size="32px" />
          <span class="inventory-add-slot__text">ADD CARD</span>
        </button>
      </div>
    </section>

    <!-- Quick Add dialog -->
    <q-dialog v-model="quickAddOpen" :full-width="!catalogLoading">
      <q-card class="dt-glass-surface dt-holo-border inventory-dialog">
        <q-bar class="q-pb-none">
          <div class="dt-heading-orbitron text-caption dt-glow-text-cyan">Quick Add</div>
          <q-space />
          <q-btn dense flat round icon="close" @click="closeQuickAdd" />
        </q-bar>

        <q-card-section class="q-pt-md q-pb-sm">
          <div class="row items-center justify-between q-gutter-sm">
            <q-input
              v-model="catalogSearch"
              dense
              outlined
              borderless
              class="inventory-controls__search"
              placeholder="Search global database..."
              debounce="200"
            >
              <template #prepend>
                <q-icon name="search" size="20px" />
              </template>
            </q-input>
            <q-btn
              class="inventory-add-selected-btn"
              color="secondary"
              text-color="dark"
              no-caps
              rounded
              :disable="!selectedCardIds.length || inventoryStore.isUpdating"
              :loading="inventoryStore.isUpdating"
              label="Add Selected"
              @click="handleAddSelected"
            />
          </div>
        </q-card-section>

        <q-separator dark />

        <q-card-section class="q-pt-md scroll">
          <q-inner-loading :showing="catalogLoading" dark>
            <q-spinner-gears color="primary" size="50px" />
          </q-inner-loading>

          <div v-if="!catalogLoading" class="inventory-grid">
            <YugiohCard
              v-for="card in filteredCatalog"
              :key="card.id"
              variant="inventory"
              :title="card.name"
              :image-url="card.imageUrl"
              rarity-label="Vault Candidate"
              rarity-variant="super-rare"
              :selected="selectedCardIds.includes(card.id)"
              :interactive="true"
              @click="toggleSelect(card.id)"
            />
          </div>

          <div v-if="catalogMore && !catalogLoading" class="row justify-center q-mt-md">
            <q-btn
              class="load-more-btn"
              flat
              color="primary"
              no-caps
              :loading="catalogLoadingMore"
              label="Load more"
              @click="loadMoreCatalog"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import YugiohCard from 'src/shared/components/YugiohCard.vue';
import type { Card } from 'src/core/types/api';

type YugiohRarity = 'common' | 'rare' | 'super-rare' | 'ultra-rare' | 'secret-rare';
import { useAuthStore } from 'src/modules/auth/store/auth.store';
import { useInventoryStore } from '../store/inventory.store';

const router = useRouter();
const authStore = useAuthStore();
const inventoryStore = useInventoryStore();

const searchQuery = ref('');
const quickAddOpen = ref(false);
const catalogSearch = ref('');
const catalogPage = ref(1);
const catalogCards = ref<Card[]>([]);
const catalogMore = ref(true);
const catalogLoading = ref(false);
const catalogLoadingMore = ref(false);
const selectedCardIds = ref<string[]>([]);

const duelistLevel = 42;
const xpCurrent = 8450;
const xpMax = 10000;
const xpProgress = computed(() => xpCurrent / xpMax);

const filteredInventory = computed(() =>
  inventoryStore.cards.filter((card) =>
    card.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  ),
);

const filteredCatalog = computed(() =>
  catalogCards.value.filter((card) =>
    card.name.toLowerCase().includes(catalogSearch.value.toLowerCase()),
  ),
);

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

onMounted(async () => {
  if (!authStore.user && authStore.token) {
    await authStore.hydrateFromToken();
  }

  if (!authStore.isAuthenticated) {
    await router.replace('/auth');
    return;
  }

  await inventoryStore.loadInventory();
});

function openQuickAdd(): Promise<void> {
  quickAddOpen.value = true;
  selectedCardIds.value = [];
  catalogCards.value = [];
  catalogPage.value = 1;
  return loadCatalog(true);
}

function closeQuickAdd(): void {
  quickAddOpen.value = false;
}

async function loadCatalog(reset: boolean): Promise<void> {
  if (reset) {
    catalogLoading.value = true;
  } else {
    catalogLoadingMore.value = true;
  }

  try {
    const response = await inventoryStore.loadCatalogPage({
      page: catalogPage.value,
      rpp: 12,
    });

    if (reset) {
      catalogCards.value = response.list;
    } else {
      catalogCards.value = [...catalogCards.value, ...response.list];
    }

    catalogMore.value = response.more;
  } finally {
    catalogLoading.value = false;
    catalogLoadingMore.value = false;
  }
}

async function loadMoreCatalog(): Promise<void> {
  if (!catalogMore.value) return;
  catalogPage.value += 1;
  await loadCatalog(false);
}

function toggleSelect(cardId: string): void {
  if (selectedCardIds.value.includes(cardId)) {
    selectedCardIds.value = selectedCardIds.value.filter((id) => id !== cardId);
  } else {
    selectedCardIds.value = [...selectedCardIds.value, cardId];
  }
}

async function handleAddSelected(): Promise<void> {
  await inventoryStore.addCards(selectedCardIds.value);
  if (!inventoryStore.errorMessage) {
    closeQuickAdd();
  }
}
</script>

<style lang="scss" scoped>
.inventory-page {
  padding: 24px 20px 40px;
}

.inventory-header {
  margin-bottom: 24px;
}

.inventory-header__title {
  font-size: 2.15rem;
  font-weight: 700;
  color: var(--dt-text-primary);
  margin: 0 0 8px;
  letter-spacing: 0.1em;
  line-height: 3rem;
}

.inventory-header__meta {
  margin-bottom: 16px;
}

.inventory-header__meta-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dt-color-cyber-blue);
  box-shadow: 0 0 8px rgba(0, 242, 255, 0.6);
  flex-shrink: 0;
}

.inventory-header__meta-text {
  font-size: 0.95rem;
  color: var(--dt-text-primary);
}

.inventory-header__xp {
  max-width: 310px;
}

.inventory-header__xp-label {
  display: block;
  font-family: 'Orbitron', system-ui, sans-serif;
  font-size: 0.5rem;
  font-weight: 200;
  letter-spacing: 0.1em;
  color: var(--dt-text-muted);
  margin-bottom: 6px;
}

.inventory-header__xp-bar-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.inventory-header__xp-bar {
  flex: 1;
  min-width: 0;
  border-radius: 6px;
  background: var(--dt-color-dark-purple);

  :deep(.q-linear-progress__track) {
    background: var(--dt-color-dark-purple);
  }

  :deep(.q-linear-progress__model) {
    background: linear-gradient(90deg, var(--dt-color-cyber-blue), rgba(0, 242, 255, 0.6));
  }
}

.inventory-header__xp-text {
  font-size: 0.7rem;
  color: var(--dt-color-cyber-blue);
  white-space: nowrap;
}

.inventory-controls {
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.inventory-controls__search {
  min-width: 200px;
  max-width: 280px;
  border-radius: 8px;
  background: var(--dt-color-surface-soft);
  border: 1px solid var(--dt-color-border-glass);
}

.inventory-controls__search :deep(.q-field__prepend),
.inventory-controls__search :deep(.q-field__native),
.inventory-controls__search :deep(.q-field__control) {
  color: var(--dt-color-cyber-blue);
  border-radius: 8px;
}

.inventory-controls__quick-add {
  background: var(--dt-color-millennium-gold);
  color: var(--dt-color-deep-navy);
  font-weight: 700;
  letter-spacing: 0.04em;
  border-radius: 8px;
  padding: 8px 16px;
}

.inventory-controls__quick-add:hover {
  box-shadow: 0 0 16px rgba(255, 215, 0, 0.4);
}

.inventory-section {
  position: relative;
  min-height: 200px;
}

.inventory-empty {
  border-radius: 18px;
  padding: 48px 24px;
}

.inventory-add-selected-btn,
.inventory-empty__cta {
  margin-top: 8px;
  background: var(--dt-color-millennium-gold);
  color: var(--dt-color-deep-navy);
  font-weight: 600;
  border-radius: 8px;
}

.inventory-add-selected-btn:hover,
.inventory-empty__cta:hover {
  box-shadow: 0 0 16px rgba(255, 215, 0, 0.4);
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}

@media (min-width: 600px) {
  .inventory-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

.inventory-add-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 220px;
  border: 2px dashed var(--dt-color-border-glass);
  border-radius: 12px;
  background: rgba(11, 16, 32, 0.4);
  color: var(--dt-text-muted);
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s,
    background 0.2s;
}

.inventory-add-slot:hover {
  border-color: var(--dt-color-cyber-blue);
  color: var(--dt-color-cyber-blue);
  background: rgba(0, 242, 255, 0.05);
}

.inventory-add-slot__text {
  font-family: 'Orbitron', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.inventory-dialog {
  max-width: 1040px;
  margin: 0 auto;
}
</style>
