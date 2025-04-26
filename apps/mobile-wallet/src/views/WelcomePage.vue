<template>
  <BaseLayout>
    <div v-if="isLoading">
      <p>Loading...</p>
    </div>
    <div v-else>
      <!-- Show login if a seed exists -->
      <div v-if="requiresPassword" class="login-wrapper">
        <h1>Welcome Back!</h1>
        <ion-input
            v-model="password"
            type="password"
            label="Password"
            label-placement="floating"
            helper-text="Enter your password"
            fill="solid"
        />
        <ion-button expand="block" @click="login">
          Enter Wallet
        </ion-button>
        <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
      </div>
      <!-- Otherwise, offer Create or Import -->
      <div v-else class="login-wrapper">
        <h1>Welcome!</h1>
        <ion-button @click="createWallet">
          Create Wallet
        </ion-button>
        <ion-text class="import-text">
          Already have a wallet?
          <a @click="importWallet">Import Seed Phrase</a>
        </ion-text>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonButton, IonInput, IonText, onIonViewWillEnter } from '@ionic/vue';
import BaseLayout from '../layouts/BaseLayout.vue';
import { useRouter } from 'vue-router';
import { getPassword } from '@/utils/secureStorage/password';
import { getSeedPhrase } from '@/utils/secureStorage/seed';
import { useResetOnLeave } from "@/composables/useResetOnLeave";

const router = useRouter();
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(true);
const requiresPassword = ref(false);

onIonViewWillEnter(async() => {
  // Check if a seed phrase is stored.
  const seed = await getSeedPhrase();
  // Convert the seed value to a boolean using double negation (!!)
  // This means: if a seed phrase exists, then a password is required.
  requiresPassword.value = !!seed;
  isLoading.value = false;
});

// clear the password (and any error) on leave
useResetOnLeave(
    [password, ''],
    [errorMessage, '']
);

const login = async() => {
  // Retrieve the stored password.
  const storedPassword = await getPassword();
  if (password.value === storedPassword) {
    // If the password is correct, navigate to the main view.
    await router.push({ name: 'dashboard' });
  } else {
    errorMessage.value = 'Incorrect password. Please try again.';
  }
};

const createWallet = async() => {
  // Navigate to the Create Password view so that a new wallet can be created
  await router.push({ name: 'createpass', query: { next: 'createseed' } });
};

const importWallet = async() => {
  // Navigate to the Create Password view specifying that a wallet will be imported
  await router.push({ name: 'createpass', query: { next: 'importseed' } });
};

</script>

<style scoped>
.login-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.import-text {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.import-text a {
  text-decoration: underline;
}
</style>
