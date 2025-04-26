<template>
  <BaseLayout>
    <!-- Holds textarea within list for consistent Ionic styling -->
    <ion-list>
      <ion-item>
        <!-- Binds textarea to seedInput, auto‑grows, and displays floating label -->
        <ion-textarea
            v-model="seedInput"
            :auto-grow="true"
            label-placement="floating"
            placeholder="Enter your mnemonic phrase"
        >
          <!-- Provides label with required indicator -->
          <div slot="label">
            Seed phrase
            <ion-text color="danger">(Required)</ion-text>
          </div>
        </ion-textarea>
      </ion-item>
    </ion-list>
    <!-- Tries to import wallet -->
    <ion-button expand="block" @click="importSeed">Import</ion-button>
    <!-- Shows validation or storage error -->
    <ion-text color="danger" v-if="errorMessage" class="error">
      {{ errorMessage }}
    </ion-text>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonButton, IonItem, IonText, IonTextarea } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { isValidMnemonic } from '@ethersproject/hdnode';
import { setSeedPhrase } from '@/utils/secureStorage/seed';
import BaseLayout from "@/layouts/BaseLayout.vue";
import { useResetOnLeave } from "@/composables/useResetOnLeave";

const router = useRouter();
const seedInput = ref('');
const errorMessage = ref('');

// clear the textarea (and any error) on leave
useResetOnLeave(
    [seedInput, ''],
    [errorMessage, '']
);

// Handles Import button click
const importSeed = async() => {
  // Clears previous error, if any
  errorMessage.value = '';

  // Normalizes input: trims whitespace and enforces lowercase
  const seed = seedInput.value.trim().toLowerCase();

  // Rejects immediately if mnemonic fails checksum or word count
  if (!isValidMnemonic(seed)) {
    errorMessage.value = 'Invalid seed phrase. Check your words.';
    return;
  }

  try {
    // Saves phrase securely, then redirects to dashboard
    await setSeedPhrase(seed);
    await router.push({ name: 'dashboard' });
  } catch (error) {
    console.error('Error:', error);
    errorMessage.value = 'Failed to import. Please try again.';
  }
};

</script>

<style scoped>
.error {
  margin-top: 1rem;
}
</style>
