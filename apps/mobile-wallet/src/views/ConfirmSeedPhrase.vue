<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Nusa Wallet</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="center-container">
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
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonList, IonItem, IonLabel } from '@ionic/vue';
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
  margin-bottom: 24px;
}

.columns {
  display: flex;
  width: 100%;
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

ion-item,
ion-button {
  margin-top: 16px;
}
</style>
