<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet/>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard" href="/tabs/dashboard">
          <ion-icon :icon="speedometerOutline"/>
          <ion-label>Dashboard</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="send" href="/tabs/send">
          <ion-icon :icon="paperPlaneOutline"/>
          <ion-label>Send</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="receive" @click="openReceiveModal">
          <ion-icon :icon="qrCodeOutline"/>
          <ion-label>Receive</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="settings" href="/tabs/settings">
          <ion-icon :icon="settingsOutline"/>
          <ion-label>Settings</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  modalController
} from '@ionic/vue';
import { paperPlaneOutline, qrCodeOutline, settingsOutline, speedometerOutline } from 'ionicons/icons';
import Receive from "@/components/Receive.vue";
import { useAccountStore } from "@/stores/accountStore";

const accountStore = useAccountStore();

const openReceiveModal = async() => {
  const modal = await modalController.create({
    component: Receive,
    componentProps: { address: accountStore.account }
  });
  await modal.present();
};

</script>
