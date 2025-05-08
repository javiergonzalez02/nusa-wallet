<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <!-- only show if the page asked for it -->
          <ion-back-button v-if="showBack" :default-href="defaultHref"/>
        </ion-buttons>
        <ion-title>{{ title || 'Nusa' }}</ion-title>
        <ion-buttons slot="end">
          <!-- will appear by default and will be hidden if specified -->
          <ion-button v-if="showLogout" :href="logoutHref">
            <ion-icon slot="icon-only" :icon="logOutOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="center-container">
        <slot></slot>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonBackButton,
  IonTitle,
  IonContent,
  IonIcon,
  IonPage
} from '@ionic/vue';
import { logOutOutline } from 'ionicons/icons';
import { defineProps } from 'vue';

defineProps({
  showBack: { type: Boolean, default: false },
  showLogout: { type: Boolean, default: true },
  defaultHref: { type: String, default: '/login' },
  logoutHref: { type: String, default: '/login' },
  title: { type: String, default: '' },
});
</script>
