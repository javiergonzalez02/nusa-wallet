<template>
  <BaseLayout>
    <h1>Confirm Seed Phrase!</h1>
    <ion-list class="columns">
      <div class="column">
        <ion-item v-for="i in 6" :key="i">
          <ion-label position="stacked">Word {{ i }}</ion-label>
          <ion-input
            v-model="seedWords[i - 1]"
            :placeholder="`Enter word ${i}`"
          ></ion-input>
        </ion-item>
      </div>
      <div class="column">
        <ion-item v-for="i in 6" :key="i + 6">
          <ion-label position="stacked">Word {{ i + 6 }}</ion-label>
          <ion-input
            v-model="seedWords[i + 5]"
            :placeholder="`Enter word ${i + 6}`"
          ></ion-input>
        </ion-item>
      </div>
    </ion-list>
    <ion-button @click="confirmSeed">
      Enter Wallet
    </ion-button>
    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonButton, IonInput, IonItem, IonLabel, IonList } from '@ionic/vue';
import BaseLayout from '../layouts/BaseLayout.vue';
import { useSeedStore } from '@/stores/seedStore';
import { setSeedPhrase } from '@/utils/secureStorage/seed';

const seedStore = useSeedStore();
const originalSeed = computed(() => seedStore.mnemonic);

// Create a reactive array for the 12 seed words.
const seedWords = ref<string[]>(new Array(12).fill(''));
const errorMessage = ref('');

const confirmSeed = async () => {
  // Join the input words into a single string.
  const inputSeed = seedWords.value.join(' ').trim();
  const expectedSeed = originalSeed.value.trim();

  if (inputSeed === expectedSeed) {
    try {
      await setSeedPhrase(expectedSeed);
      alert('Seed phrase saved successfully!');
    } catch (error) {
      errorMessage.value = 'Error saving seed phrase to secure storage.';
      console.error('Error:', error);
    }
  } else {
    errorMessage.value = 'Seed phrase does not match. Please try again.';
  }
};
</script>

<style scoped>
.columns {
  display: flex;
  width: 100%;
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
