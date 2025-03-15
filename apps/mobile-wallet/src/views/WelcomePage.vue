<template>
  <ion-page>
    <NusaHeader/>
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
import {IonButton, IonContent, IonInput, IonPage} from '@ionic/vue';
import NusaHeader from "@/components/NusaHeader.vue";
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

.center-container ion-item,
.center-container ion-button {
  margin-top: 16px;
}
</style>