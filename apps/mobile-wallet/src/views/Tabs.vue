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
  IonPage,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonRouterOutlet,
  IonLabel,
  IonIcon
} from '@ionic/vue';
import { speedometerOutline, settingsOutline, paperPlaneOutline } from 'ionicons/icons';

</script>
