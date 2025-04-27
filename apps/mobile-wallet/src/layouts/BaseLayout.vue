<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <!-- only show if the page asked for it -->
        <ion-buttons slot="start" v-if="showBack">
          <ion-back-button :default-href="defaultHref"/>
        </ion-buttons>
        <ion-title>{{ title || 'Nusa' }}</ion-title>
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
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonPage } from '@ionic/vue';
import { defineProps } from 'vue';

defineProps({
  showBack: { type: Boolean, default: false },
  title: { type: String, default: '' },
  defaultHref: { type: String, default: '/welcome' },
});
</script>
