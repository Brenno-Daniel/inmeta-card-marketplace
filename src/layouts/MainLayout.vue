<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="dt-header">
      <q-toolbar class="dt-header__toolbar">
        <!-- Left: Logo + Brand -->
        <router-link to="/" class="dt-header__brand row items-center no-wrap">
          <div class="dt-header__logo" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.25"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L21 8v8L12 22L3 16V8L12 2Z" />
            </svg>
          </div>
          <span class="dt-header__title dt-heading-orbitron">DuelTrade</span>
        </router-link>

        <!-- Mobile: Hamburger with nav inside drawer -->
        <q-btn
          v-if="authStore.isAuthenticated && $q.screen.lt.md"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="q-ml-sm dt-text-millennium-gold dt-glow-text-gold"
          @click="drawerOpen = true"
        />

        <q-space />

        <!-- Center: Nav (auth only), visible on desktop -->
        <nav v-if="authStore.isAuthenticated" class="dt-header__nav gt-sm">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'dt-header__nav-link',
              { 'dt-header__nav-link--active': isActivePath(item.path) },
            ]"
          >
            <!-- Marketplace: hexagon outline icon -->
            <span
              v-if="item.icon === 'hexagon'"
              class="dt-header__nav-icon-hexagon"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L21 8v8L12 22L3 16V8L12 2Z" />
              </svg>
            </span>
            <q-icon v-else :name="item.icon" size="20px" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>

        <q-space />

        <!-- Right: Guest CTA or Profile -->
        <div class="dt-header__actions">
          <template v-if="!authStore.isAuthenticated">
            <q-btn to="/auth" class="dt-header__cta" no-caps flat unelevated>
              <span v-if="$q.screen.gt.xs" class="row items-center no-wrap q-gutter-xs truncate">
                <span>Join Duelist Hub</span>
                <q-icon name="login" size="18px" />
              </span>
              <q-icon v-else name="login" size="16px" />
            </q-btn>
          </template>
          <template v-else>
            <!-- Profile button + dropdown (hidden on mobile; drawer has logout) -->
            <q-chip v-if="$q.screen.gt.xs" color="primary" @click="profileMenuOpen = false">
              <q-avatar>
                <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
              </q-avatar>
              {{ displayName }}
            </q-chip>
            <q-btn v-else round color="primary">
              <q-avatar size="42px">
                <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
              </q-avatar>
            </q-btn>

            <q-menu
              v-model="profileMenuOpen"
              class="dt-header__dropdown"
              anchor="bottom left"
              self="top left"
              transition-show="jump-down"
              transition-hide="jump-up"
            >
              <q-list class="dt-header__dropdown-list">
                <q-item disable>
                  <q-item-section avatar>
                    <q-icon name="settings" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Update Data</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="handleLogout">
                  <q-item-section avatar>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Logout</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </template>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Mobile drawer: nav links when authenticated -->
    <q-drawer
      v-model="drawerOpen"
      side="left"
      overlay
      bordered
      dark
      class="dt-header__drawer"
      :width="280"
    >
      <q-list v-if="authStore.isAuthenticated" class="q-pt-lg">
        <q-item-label header class="dt-heading-orbitron text-caption dt-text-muted"
          >Menu</q-item-label
        >
          <q-item
            v-for="item in navItems"
            :key="item.path"
            clickable
            :to="item.path"
            :active="isActivePath(item.path)"
            active-class="dt-header__drawer-item--active"
            @click="drawerOpen = false"
          >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
        <q-separator class="q-my-md" />
        <q-item
          clickable
          @click="
            handleLogout();
            drawerOpen = false;
          "
        >
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>Logout</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from 'src/modules/auth/store/auth.store';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const profileMenuOpen = ref(false);
const drawerOpen = ref(false);

const navItems = [
  { path: '/', label: 'Marketplace', icon: 'hexagon' },
  { path: '/inventory', label: 'My Inventory', icon: 'grid_view' },
  { path: '/trade', label: 'Trade Portal', icon: 'swap_horiz' },
  { path: '/active-trades', label: 'Active Trades', icon: 'show_chart' },
] as const;

const isActivePath = (path: string): boolean => route.path === path;

const displayName = computed(() => {
  const name = authStore.user?.name ?? '';
  const max = 14;
  if (name.length <= max) return name;
  return `${name.slice(0, max)}…`;
});

async function handleLogout(): Promise<void> {
  authStore.logout();
  profileMenuOpen.value = false;
  await router.replace('/');
}

onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.hydrateFromToken();
  }
});
</script>

<style lang="scss" scoped>
.dt-header {
  background: var(--dt-color-deep-navy);
  border-bottom: 1px solid var(--dt-color-border-glass);
}

.dt-header__toolbar {
  min-height: 56px;
  padding-left: 20px;
  padding-right: 20px;
}

.dt-header__brand {
  text-decoration: none;
  color: var(--dt-text-primary);
  gap: 12px;
}

.dt-header__logo {
  width: 26px;
  height: 26px;
  color: var(--dt-color-millennium-gold);
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
  }
}

.dt-header__title {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--dt-text-primary);
  text-shadow: 0 0 20px rgba(249, 250, 251, 0.15);
}

@media (max-width: 300px) {
  .dt-header__brand {
    gap: 5px;
  }

  .dt-header__logo {
    width: 20px;
    height: 20px;
  }

  .dt-header__title {
    font-size: 1rem;
    letter-spacing: 0.008em;
  }
}

.dt-header__nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.dt-header__nav-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  color: var(--dt-color-cyber-blue);
  text-decoration: none;
  font-size: 0.95rem;
  font-family: 'Rajdhani', system-ui, sans-serif;
  font-weight: 500;
  transition:
    color 0.2s,
    background 0.2s;

  &:hover {
    color: var(--dt-text-primary);
    background: rgba(255, 255, 255, 0.04);
  }

  &.dt-header__nav-link--active {
    color: var(--dt-color-millennium-gold);
    background: rgba(255, 215, 0, 0.06);
  }
}

.dt-header__nav-icon-hexagon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;

  svg {
    width: 100%;
    height: 100%;
  }
}

.dt-header__cta.q-btn {
  color: var(--dt-color-cyber-blue) !important;
  background: rgba(5, 22, 40, 0.98) !important;
  border: 1px solid var(--dt-color-cyber-blue);
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 3px 6px;
  box-shadow: 0 0 12px rgba(0, 242, 255, 0.25);

  &:hover {
    background: rgba(0, 242, 255, 0.08) !important;
    box-shadow: 0 0 16px rgba(0, 242, 255, 0.35);
  }
}

.dt-header__profile-btn {
  color: var(--dt-text-primary);
}

.dt-header__dropdown .dt-header__dropdown-list {
  background: var(--dt-color-surface-elevated);
  border: 1px solid var(--dt-color-border-glass);
  border-radius: 8px;
}

.dt-header__dropdown .dt-header__dropdown-list .q-item__section--avatar,
.dt-header__drawer .q-item__section--avatar {
  min-width: 0;
}

.dt-header__drawer {
  background: var(--dt-color-deep-navy);
}

.dt-header__drawer-item--active {
  color: var(--dt-color-millennium-gold);
}
</style>
