<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Nusa Wallet</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="center-container">
        <h1>Welcome!</h1>
        <!-- Password Input Field-->
        <ion-item>
          <ion-input label="Password" label-placement="stacked" placeholder="Enter password"></ion-input>
        </ion-item>
        <!-- Sing In Button -->
        <ion-button>
          Enter Wallet
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton} from '@ionic/vue';

const password = ref('');
</script>

<style scoped>
.center-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
}
</style>