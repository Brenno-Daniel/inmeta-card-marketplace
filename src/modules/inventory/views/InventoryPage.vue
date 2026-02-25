<template>
  <q-page class="q-pa-lg q-pa-md-md">
    <div class="column q-gutter-y-lg">
      <section class="row items-center justify-between q-gutter-y-sm q-gutter-x-md">
        <div class="column q-gutter-y-xs">
          <div class="dt-heading-orbitron text-h5 dt-glow-text-cyan">
            My Deck Box
          </div>
          <div class="row items-center q-gutter-x-md text-caption dt-text-muted">
            <span>Level 42 Duelist · {{ inventoryStore.cardCount }} cards in vault</span>
            <q-linear-progress
              value="0.42"
              color="primary"
              track-color="dark"
              class="inventory-xp-bar"
            />
          </div>
        </div>

        <div class="row items-center q-gutter-sm">
          <q-input
            v-model="searchQuery"
            dense
            standout="bg-transparent"
            bg-color="transparent"
            color="primary"
            class="dt-input-glow inventory-search"
            placeholder="Search inventory..."
            debounce="200"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-btn
            color="secondary"
            text-color="dark"
            no-caps
            rounded
            class="dt-holo-glow"
            icon="add"
            label="Quick Add"
            @click="openQuickAdd"
          />
        </div>
      </section>

      <section>
        <q-inner-loading :showing="inventoryStore.isLoading">
          <q-spinner-gears color="secondary" size="64px" />
        </q-inner-loading>

        <div
          v-if="!inventoryStore.isLoading && !filteredInventory.length"
          class="dt-glass-surface dt-holo-border q-pa-xl flex flex-center text-center"
        >
          <div class="column items-center q-gutter-y-sm">
            <q-icon name="inventory_2" size="40px" color="primary" />
            <div class="text-subtitle2">Your vault is empty</div>
            <div class="dt-text-muted text-caption">
              Summon your first cards using the Quick Add terminal.
            </div>
            <q-btn
              color="secondary"
              text-color="dark"
              no-caps
              rounded
              class="q-mt-sm"
              icon="add"
              label="Quick Add"
              @click="openQuickAdd"
            />
          </div>
        </div>

        <div
          v-else
          class="inventory-grid"
        >
          <YugiohCard
            v-for="card in filteredInventory"
            :key="card.id"
            :title="card.name"
            :image-url="card.imageUrl"
            :subtitle="formatCreatedAt(card.createdAt)"
            :description="card.description"
            rarity-label="Ultra Rare"
            rarity-variant="ultra-rare"
          />
        </div>
      </section>

      <q-dialog v-model="quickAddOpen" persistent maximized>
        <q-card class="dt-glass-surface dt-holo-border q-pa-md inventory-dialog">
          <q-bar class="q-pb-none">
            <div class="dt-heading-orbitron text-caption dt-glow-text-cyan">
              Quick Add
            </div>
            <q-space />
            <q-btn dense flat round icon="close" @click="closeQuickAdd" />
          </q-bar>

          <q-card-section class="q-pt-md q-pb-sm">
            <div class="row items-center justify-between q-gutter-sm">
              <q-input
                v-model="catalogSearch"
                dense
                standout="bg-transparent"
                bg-color="transparent"
                color="primary"
                class="dt-input-glow inventory-search-dialog"
                placeholder="Search global database..."
                debounce="200"
              >
                <template #prepend>
                  <q-icon name="search" />
                </template>
              </q-input>

              <q-btn
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
            <q-inner-loading :showing="catalogLoading">
              <q-spinner-gears color="secondary" size="64px" />
            </q-inner-loading>

            <div v-if="!catalogLoading" class="inventory-grid">
              <YugiohCard
                v-for="card in filteredCatalog"
                :key="card.id"
                :title="card.name"
                :image-url="card.imageUrl"
                :subtitle="formatCreatedAt(card.createdAt)"
                :description="card.description"
                rarity-label="Vault Candidate"
                rarity-variant="super-rare"
                :selected="selectedCardIds.includes(card.id)"
                @click="toggleSelect(card.id)"
              />
            </div>

            <div
              v-if="catalogMore && !catalogLoading"
              class="row justify-center q-mt-md"
            >
              <q-btn
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
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import YugiohCard from 'src/shared/components/YugiohCard.vue';
import { useAuthStore } from 'src/modules/auth/store/auth.store';
import { useInventoryStore } from '../store/inventory.store';

const router = useRouter();
const authStore = useAuthStore();
const inventoryStore = useInventoryStore();

const searchQuery = ref('');

const quickAddOpen = ref(false);
const catalogSearch = ref('');
const catalogPage = ref(1);
const catalogCards = ref(inventoryStore.cards.slice());
const catalogMore = ref(true);
const catalogLoading = ref(false);
const catalogLoadingMore = ref(false);
const selectedCardIds = ref<string[]>([]);

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

function formatCreatedAt(createdAt: string): string {
  const date = new Date(createdAt);
  return date.toLocaleDateString();
}

async function openQuickAdd(): Promise<void> {
  quickAddOpen.value = true;
  selectedCardIds.value = [];
  catalogCards.value = [];
  catalogPage.value = 1;
  await loadCatalog(true);
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
  if (!catalogMore.value) {
    return;
  }

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

<style scoped>
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 18px;
}

.inventory-xp-bar {
  width: 180px;
  max-width: 40vw;
}

.inventory-search {
  min-width: 210px;
}

.inventory-dialog {
  max-width: 1040px;
  margin: 0 auto;
}

.inventory-search-dialog {
  min-width: 260px;
}
</style>

