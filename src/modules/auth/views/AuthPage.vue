<template>
  <q-page class="dt-hero-bg flex flex-center q-pa-md">
    <div class="auth-shell column items-center q-gutter-y-lg">
      <div class="row items-center q-gutter-x-sm">
        <div class="auth-logo-glow" />
        <div class="column">
          <div class="dt-heading-orbitron auth-logo-text dt-glow-text-gold">
            DuelTrade
          </div>
          <div class="dt-text-muted text-caption">
            Secure access terminal for elite duelists
          </div>
        </div>
      </div>

      <q-card class="dt-glass-surface dt-holo-border auth-card">
        <q-card-section>
          <div class="column q-gutter-y-xs q-mb-md">
            <div class="dt-heading-orbitron auth-title dt-glow-text-cyan">
              {{ isLoginMode ? 'Access Terminal' : 'Register Duelist' }}
            </div>
            <div class="dt-text-muted text-caption">
              {{ isLoginMode ? loginSubtitle : registerSubtitle }}
            </div>
          </div>

          <q-form @submit.prevent="handleSubmit">
            <div class="column q-gutter-md">
              <q-slide-transition>
                <div v-if="!isLoginMode" class="column q-gutter-xs">
                  <div class="text-caption text-uppercase text-grey-4">
                    Duelist Name
                  </div>
                  <q-input
                    v-model="registerForm.name"
                    dense
                    standout="bg-transparent"
                    bg-color="transparent"
                    color="primary"
                    class="dt-input-glow"
                    autocomplete="username"
                    :disable="isSubmitting"
                    :error="Boolean(formError && !registerForm.name)"
                    :error-message="!registerForm.name ? 'Name is required' : ''"
                  >
                    <template #prepend>
                      <q-icon name="person" />
                    </template>
                  </q-input>
                </div>
              </q-slide-transition>

              <div class="column q-gutter-xs">
                <div class="text-caption text-uppercase text-grey-4">
                  Comlink Email
                </div>
                <q-input
                  v-model="form.email"
                  dense
                  standout="bg-transparent"
                  bg-color="transparent"
                  color="primary"
                  class="dt-input-glow"
                  autocomplete="email"
                  type="email"
                  :disable="isSubmitting"
                  :error="Boolean(formError && !form.email)"
                  :error-message="!form.email ? 'Email is required' : ''"
                >
                  <template #prepend>
                    <q-icon name="mail" />
                  </template>
                </q-input>
              </div>

              <div class="column q-gutter-xs">
                <div class="row items-center justify-between">
                  <div class="text-caption text-uppercase text-grey-4">
                    Security Code
                  </div>
                  <q-btn
                    v-if="isLoginMode"
                    flat
                    dense
                    no-caps
                    class="text-primary text-caption"
                    label="Forgot code?"
                  />
                </div>
                <q-input
                  v-model="form.password"
                  dense
                  standout="bg-transparent"
                  bg-color="transparent"
                  color="primary"
                  class="dt-input-glow"
                  autocomplete="current-password"
                  :type="showPassword ? 'text' : 'password'"
                  :disable="isSubmitting"
                  :error="Boolean(formError && !form.password)"
                  :error-message="!form.password ? 'Security code is required' : ''"
                >
                  <template #prepend>
                    <q-icon name="lock" />
                  </template>
                  <template #append>
                    <q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>
              </div>

              <q-slide-transition>
                <q-banner
                  v-if="authError"
                  rounded
                  dense
                  class="bg-negative text-white q-px-md q-py-sm"
                >
                  <div class="row items-center no-wrap q-gutter-x-sm">
                    <q-icon name="warning" size="18px" />
                    <span class="text-caption">{{ authError }}</span>
                  </div>
                </q-banner>
              </q-slide-transition>

              <q-btn
                type="submit"
                class="q-mt-sm dt-holo-glow"
                color="secondary"
                text-color="dark"
                size="lg"
                no-caps
                unelevated
                rounded
                :label="isLoginMode ? 'Initialize' : 'Register'"
                :loading="isSubmitting"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-separator dark inset />

        <q-card-section class="row justify-between items-center text-caption">
          <div class="dt-text-muted">
            {{ isLoginMode ? 'No profile detected?' : 'Already registered?' }}
          </div>
          <q-btn
            flat
            dense
            no-caps
            class="text-secondary text-weight-bold"
            :label="isLoginMode ? 'Create Profile' : 'Login Now'"
            @click="toggleMode"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth.store';

type AuthMode = 'login' | 'register';

interface AuthFormState {
  email: string;
  password: string;
}

interface RegisterFormState {
  name: string;
}

const router = useRouter();
const authStore = useAuthStore();

const mode = ref<AuthMode>('login');
const form = reactive<AuthFormState>({
  email: '',
  password: '',
});
const registerForm = reactive<RegisterFormState>({
  name: '',
});
const showPassword = ref(false);
const formError = ref(false);
const isSubmitting = ref(false);

const isLoginMode = computed(() => mode.value === 'login');

const loginSubtitle =
  'Enter your comlink credentials to access the Duelist Hub.';
const registerSubtitle =
  'Initialize a new duelist profile and join the marketplace.';

const authError = computed(() => authStore.errorMessage);

watchEffect(() => {
  if (authStore.isAuthenticated) {
    void router.replace('/');
  }
});

function toggleMode(): void {
  mode.value = isLoginMode.value ? 'register' : 'login';
  formError.value = false;
  authStore.errorMessage = null;
}

async function handleSubmit(): Promise<void> {
  formError.value = false;

  if (!form.email || !form.password || (!isLoginMode.value && !registerForm.name)) {
    formError.value = true;
    return;
  }

  isSubmitting.value = true;

  try {
    if (isLoginMode.value) {
      await authStore.login({
        email: form.email,
        password: form.password,
      });
      await router.replace('/');
      return;
    }

    await authStore.register({
      name: registerForm.name,
      email: form.email,
      password: form.password,
    });

    mode.value = 'login';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.auth-shell {
  max-width: 480px;
  width: 100%;
}

.auth-logo-glow {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: radial-gradient(circle, #ffd700 0, #facc15 36%, #1d1135 90%);
  box-shadow:
    0 0 18px rgba(255, 215, 0, 0.9),
    0 0 28px rgba(250, 204, 21, 0.8);
}

.auth-logo-text {
  font-size: 1.2rem;
}

.auth-card {
  width: 100%;
}

.auth-title {
  font-size: 1rem;
}

.dt-input-glow :deep(.q-field__control) {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: radial-gradient(circle at top left, rgba(0, 242, 255, 0.12), transparent);
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.9),
    0 0 18px rgba(15, 23, 42, 0.9);
}

.dt-input-glow :deep(.q-field__control:hover) {
  border-color: rgba(59, 130, 246, 0.7);
}

.dt-input-glow :deep(.q-field__native),
.dt-input-glow :deep(.q-field__input) {
  padding-inline: 10px;
}
</style>

