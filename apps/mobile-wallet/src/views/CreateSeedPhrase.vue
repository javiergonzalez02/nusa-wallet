<template>
  <BaseLayout>
    <!-- Seed Phrase Card-->
    <ion-card color="primary">
      <ion-card-header>
        <ion-card-title>Seed Phrase</ion-card-title>
        <ion-card-subtitle>Write down your recovery phrase and store it in a secure location</ion-card-subtitle>
      </ion-card-header>
      <ion-card-content>
        {{ mnemonic }}
      </ion-card-content>
    </ion-card>
    <!-- Buttons -->
    <ion-button @click="goToConfirm">
      Confirm Seed Phrase
    </ion-button>
  </BaseLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/vue';
import { useRouter } from 'vue-router';
import BaseLayout from '../layouts/BaseLayout.vue';
import { useSeedStore } from '@/stores/seedStore';

const router = useRouter();
const seedStore = useSeedStore();

// Use a computed property to keep the mnemonic reactive.
const mnemonic = computed(() => seedStore.mnemonic);

// generate mnemonic on mount
onMounted(() => {
  seedStore.generateMnemonic();
});

const goToConfirm = () => {
  router.push({ name: 'confirmseed' });
};
</script>
