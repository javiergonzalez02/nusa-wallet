<template>
  <ion-header>
    <ion-toolbar color="primary">
      <ion-title>Receive</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="dismiss">Close</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <div class="qr-container">
      <qrcode-vue :value="address" :size="200" />
    </div>
    <p class="address-text">{{ address }}</p>
  </ion-content>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { IonButton, IonButtons, IonContent, IonHeader, IonToolbar, modalController } from '@ionic/vue';
import QrcodeVue from 'qrcode.vue';

defineProps<{ address: string }>();

const dismiss = async () => {
  const modal = await modalController.getTop();
  if (modal) {
    await modal.dismiss();
  }
};
</script>

<style scoped>
.qr-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
.address-text {
  text-align: center;
  margin-top: 1rem;
}
</style>
