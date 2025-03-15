<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Nusa Wallet</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="center-container">
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
.center-container h1 {
  margin-bottom: 80px;
}

.center-container ion-item {
  margin-bottom: 16px;
}

.center-container ion-button {
  margin-top: 16px;
}
</style>