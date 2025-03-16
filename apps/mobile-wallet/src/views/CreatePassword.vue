<template>
  <BaseLayout>
    <h1>Create your Password!</h1>
    <!-- Password Input Field-->
    <ion-item>
      <ion-input label="Password" label-placement="stacked" placeholder="Enter password"></ion-input>
    </ion-item>
    <!-- Password Input Field-->
    <ion-item>
      <ion-input label="Repeat Password" label-placement="stacked" placeholder="Repeat password"></ion-input>
    </ion-item>
    <!-- Sing In Button -->
    <ion-button>
      Enter Wallet
    </ion-button>
  </BaseLayout>
</template>

<script setup lang="ts">
import {IonButton, IonItem, IonInput} from '@ionic/vue';
import BaseLayout from '../layouts/BaseLayout.vue';
</script>
