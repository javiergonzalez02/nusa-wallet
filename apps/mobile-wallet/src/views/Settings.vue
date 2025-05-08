<template>
  <BaseLayout>
    <ion-content>
      <ion-list :inset="true" lines="none">
        <!-- Network settings -->
        <ion-item button @click="goToNetworkSettings">
          <ion-label>Network Settings</ion-label>
          <ion-icon slot="end" name="chevron-forward-outline"/>
        </ion-item>
        <!-- Security settings -->
        <ion-item button @click="goToSecuritySettings">
          <ion-label>Security Settings</ion-label>
          <ion-icon slot="end" name="chevron-forward-outline"/>
        </ion-item>
      </ion-list>
    </ion-content>
  </BaseLayout>
</template>

<script lang="ts" setup>
import { IonContent, IonIcon, IonItem, IonLabel, IonList } from '@ionic/vue';
import { useRouter } from "vue-router";
import BaseLayout from "@/layouts/BaseLayout.vue";

// reactive state
const router = useRouter();

const goToNetworkSettings = () => {
  router.push({ name: 'NetworkSettings' });
};

const goToSecuritySettings = () => {
  router.push({ name: 'SecuritySettings' });
};

</script>
