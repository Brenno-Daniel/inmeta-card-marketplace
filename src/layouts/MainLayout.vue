<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="dt-header">
      <q-toolbar class="dt-header__toolbar">
        <!-- Left: Logo + Brand -->
        <router-link to="/" class="dt-header__brand row items-center no-wrap">
          <div class="dt-header__logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L22 8v8L12 22L2 16V8L12 2Z" />
            </svg>
          </div>
          <span class="dt-header__title dt-heading-orbitron">DuelTrade</span>
        </router-link>

        <q-space />

        <!-- Center: Nav (auth only), visible on desktop -->
        <nav v-if="authStore.isAuthenticated" class="dt-header__nav gt-sm">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="dt-header__nav-link"
            active-class="dt-header__nav-link--active"
          >
            <q-icon :name="item.icon" size="sm" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>

        <q-space />

        <!-- Right: Guest CTA or Profile -->
        <div class="dt-header__actions">
          <template v-if="!authStore.isAuthenticated">
            <q-btn
              to="/auth"
              label="Join Duelist Hub"
              class="dt-header__cta dt-holo-glow"
              no-caps
              unelevated
            />
          </template>
          <template v-else>
            <!-- Mobile: Hamburger with nav inside drawer -->
            <q-btn
              v-if="$q.screen.lt.md"
              flat
              dense
              round
              icon="menu"
              aria-label="Menu"
              @click="drawerOpen = true"
            />
            <!-- Profile button + dropdown (hidden on mobile; drawer has logout) -->
            <q-btn
              v-if="$q.screen.gt.md"
              flat
              no-caps
              class="dt-header__profile-btn"
              :label="displayName"
              @click="profileMenuOpen = true"
            >
              <q-avatar size="28px" class="q-mr-sm" color="primary" text-color="dark">
                {{ avatarLetter }}
              </q-avatar>
              <q-icon name="expand_more" size="xs" />
            </q-btn>
            <q-menu v-model="profileMenuOpen" class="dt-header__dropdown" anchor="bottom right" self="top right">
              <q-list class="dt-header__dropdown-list">
                <q-item disable>
                  <q-item-section avatar>
                    <q-icon name="sync" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Update Data</q-item-label>
                    <q-item-label caption>Coming soon</q-item-label>
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
      side="right"
      overlay
      bordered
      class="dt-header__drawer"
      :width="280"
    >
      <q-list v-if="authStore.isAuthenticated" class="q-pt-lg">
        <q-item-label header class="dt-heading-orbitron text-caption dt-text-muted">Menu</q-item-label>
        <q-item
          v-for="item in navItems"
          :key="item.path"
          clickable
          :to="item.path"
          exact
          active-class="dt-header__drawer-item--active"
          @click="drawerOpen = false"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
        <q-separator class="q-my-md" />
        <q-item clickable @click="handleLogout(); drawerOpen = false;">
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
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/modules/auth/store/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const profileMenuOpen = ref(false);
const drawerOpen = ref(false);

const navItems = [
  { path: '/', label: 'Marketplace', icon: 'store' },
  { path: '/inventory', label: 'Inventory', icon: 'grid_view' },
  { path: '/trade', label: 'Trade Portal', icon: 'swap_horiz' },
  { path: '/active-trades', label: 'Active Trades', icon: 'list' },
] as const;

const displayName = computed(() => {
  const name = authStore.user?.name ?? '';
  const max = 14;
  if (name.length <= max) return name;
  return `${name.slice(0, max)}…`;
});

const avatarLetter = computed(() => {
  const name = authStore.user?.name ?? '?';
  return name.charAt(0).toUpperCase();
});

function handleLogout(): void {
  authStore.logout();
  profileMenuOpen.value = false;
  router.replace('/');
}

onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.hydrateFromToken();
  }
});
</script>

<style lang="scss" scoped>
.dt-header {
  background: var(--dt-color-surface);
  border-bottom: 1px solid var(--dt-color-border-glass);
}

.dt-header__toolbar {
  min-height: 56px;
  padding-left: 16px;
  padding-right: 16px;
}

.dt-header__brand {
  text-decoration: none;
  color: var(--dt-text-primary);
  gap: 10px;
}

.dt-header__logo {
  width: 32px;
  height: 32px;
  color: var(--dt-color-cyber-blue);

  svg {
    width: 100%;
    height: 100%;
  }
}

.dt-header__title {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--dt-text-primary);
}

.dt-header__nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dt-header__nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--dt-text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: var(--dt-text-primary);
    background: var(--dt-color-surface-soft);
  }

  &.dt-header__nav-link--active {
    color: var(--dt-color-cyber-blue);
    background: rgba(0, 242, 255, 0.08);
  }
}

.dt-header__cta {
  color: var(--dt-color-deep-navy);
  background: var(--dt-color-millennium-gold);
  font-weight: 600;
  letter-spacing: 0.06em;
}

.dt-header__profile-btn {
  color: var(--dt-text-primary);
}

.dt-header__dropdown {
  background: var(--dt-color-surface-elevated);
  border: 1px solid var(--dt-color-border-glass);
  border-radius: 8px;
}

.dt-header__dropdown-list {
  min-width: 200px;
  padding: 4px;
}

.dt-header__drawer {
  background: var(--dt-color-surface);
}

.dt-header__drawer-item--active {
  color: var(--dt-color-cyber-blue);
}
</style>
