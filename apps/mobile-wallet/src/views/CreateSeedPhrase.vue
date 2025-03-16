<template>
  <BaseLayout>
    <h1>Welcome!</h1>
    <!-- Seed Phrase Card-->
    <ion-card>
      <ion-card-header>
        <ion-card-title>Seed Phrase</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        dynamic glow marble become give assume woman gain fantasy plate hover able
      </ion-card-content>
    </ion-card>
    <!-- Sing In Button -->
    <ion-button>
      Enter Wallet
    </ion-button>
  </BaseLayout>
</template>

<script setup lang="ts">
import {IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent} from '@ionic/vue';
import BaseLayout from '../layouts/BaseLayout.vue';
</script>
