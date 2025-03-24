<template>
  <BaseLayout>
    <div v-if="isLoading">
      <p>Loading...</p>
    </div>
    <div v-else>
      <h1>Welcome!</h1>
      <!-- Show login if a seed exists -->
      <div v-if="requiresPassword">
        <ion-item>
          <ion-input
              v-model="password"
              type="password"
              label="Password"
              label-placement="stacked"
              placeholder="Enter password"
          ></ion-input>
        </ion-item>
        <ion-button @click="login">
          Enter Wallet
        </ion-button>
        <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
      </div>
      <!-- Otherwise, show the Create Wallet button -->
      <div v-else>
        <ion-button @click="createWallet">
          Create Wallet
        </ion-button>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonButton, IonItem, IonInput } from '@ionic/vue';
import BaseLayout from '../layouts/BaseLayout.vue';
import { useRouter } from 'vue-router';
import { getPassword } from '@/utils/secureStorage/password';
import { getSeedPhrase } from '@/utils/secureStorage/seed';

const router = useRouter();
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(true);
const requiresPassword = ref(false);

onMounted(async() => {
  // Check if a seed phrase is stored.
  const seed = await getSeedPhrase();
  // Convert the seed value to a boolean using double negation (!!)
  // This means: if a seed phrase exists, then a password is required.
  requiresPassword.value = !!seed;
  isLoading.value = false;
});

const login = async() => {
  // Retrieve the stored password.
  const storedPassword = await getPassword();
  if (password.value === storedPassword) {
    // If the password is correct, navigate to the main view.
    await router.push({ name: 'mainview' });
  } else {
    errorMessage.value = 'Incorrect password. Please try again.';
  }
};

const createWallet = async() => {
  // Navigate to the Create Password view so that a new wallet can be created.
  await router.push({ name: 'createpass' });
};
</script>
