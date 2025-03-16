<template>
  <ion-page>
    <NusaHeader/>
    <ion-content :fullscreen="true">
      <div class="center-container">
        <slot></slot>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {IonContent, IonPage} from '@ionic/vue';
import NusaHeader from "@/components/NusaHeader.vue";
</script>
