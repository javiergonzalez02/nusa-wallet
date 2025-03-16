<template>
  <BaseLayout>
    <h1>Confirm Seed Phrase!</h1>
    <ion-list class="columns">
      <div class="column">
        <ion-item v-for="i in 6" :key="i">
          <ion-label position="stacked">Word {{ i }}</ion-label>
          <ion-input :placeholder="`Enter word ${i}`"></ion-input>
        </ion-item>
      </div>
      <div class="column">
        <ion-item v-for="i in 6" :key="i + 6">
          <ion-label position="stacked">Word {{ i + 6 }}</ion-label>
          <ion-input :placeholder="`Enter word ${i + 6}`"></ion-input>
        </ion-item>
      </div>
    </ion-list>
    <ion-button>
      Enter Wallet
    </ion-button>
  </BaseLayout>
</template>

<script setup lang="ts">
import {IonButton, IonInput, IonItem, IonLabel, IonList} from '@ionic/vue';
import BaseLayout from '../layouts/BaseLayout.vue';
</script>

<style scoped>

.columns {
  display: flex;
  width: 100%;
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

</style>
