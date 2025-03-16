<template>
  <BaseLayout>
    <h1>Welcome!</h1>
    <ion-item>
      <ion-input label="Password" label-placement="stacked" placeholder="Enter password"></ion-input>
    </ion-item>
    <ion-button>
      Enter Wallet
    </ion-button>
  </BaseLayout>
</template>

<script setup lang="ts">
import {IonButton, IonItem, IonInput} from '@ionic/vue';
import BaseLayout from '../layouts/BaseLayout.vue';
</script>
