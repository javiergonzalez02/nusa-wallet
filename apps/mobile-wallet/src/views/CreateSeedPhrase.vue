<template>
  <BaseLayout>
    <h1>Welcome!</h1>
    <!-- Seed Phrase Card-->
    <ion-card>
      <ion-card-header>
        <ion-card-title>Seed Phrase</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        {{ mnemonic }}
      </ion-card-content>
    </ion-card>
    <!-- Buttons -->
    <ion-button @click="generateNewMnemonic">
      Generate New Seed Phrase
    </ion-button>
    <ion-button @click="goToConfirm">
      Confirm Seed Phrase
    </ion-button>
  </BaseLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/vue';
import { useRouter } from 'vue-router';
import BaseLayout from '../layouts/BaseLayout.vue';
import { useSeedStore } from '@/stores/seedStore';

const router = useRouter();
const seedStore = useSeedStore();

// Use a computed property to keep the mnemonic reactive.
const mnemonic = computed(() => seedStore.mnemonic);

const generateNewMnemonic = () => {
  seedStore.generateMnemonic();
};

const goToConfirm = () => {
  router.push({ name: 'confirmseed' });
};
</script>
