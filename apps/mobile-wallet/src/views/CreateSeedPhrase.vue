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
    <!-- Sing In Button -->
    <ion-button @click="generateNewMnemonic">
      Generate New Seed Phrase
    </ion-button>
  </BaseLayout>
</template>

<script setup lang="ts">
import {IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent} from '@ionic/vue';
import BaseLayout from '../layouts/BaseLayout.vue';

import {useMnemonic} from "../../../../packages/wallet-core";

const { mnemonic, generateNewMnemonic } = useMnemonic();
</script>
