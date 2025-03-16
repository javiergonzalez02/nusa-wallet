<template>
  <ion-page>
    <ion-header>
      <!-- Primary toolbar with title and settings button -->
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="dashboard-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Account Info</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>Your Account: Main Account</p>
          </ion-card-content>
        </ion-card>
        <ion-segment v-model="segment" color="primary">
          <ion-segment-button value="activity">
            <ion-label>Activity</ion-label>
          </ion-segment-button>
          <ion-segment-button value="assets">
            <ion-label>Assets</ion-label>
          </ion-segment-button>
        </ion-segment>
        <!-- Conditionally display content based on selected segment -->
        <template v-if="segment === 'activity'">
          <section class="activity-section">
            <ion-list>
              <ion-item>
                <ion-label>Transaction 1</ion-label>
              </ion-item>
              <ion-item>
                <ion-label>Transaction 2</ion-label>
              </ion-item>
            </ion-list>
          </section>
        </template>
        <template v-else-if="segment === 'assets'">
          <section class="assets-section">
            <ion-list>
              <ion-item>
                <ion-label>Asset 1</ion-label>
              </ion-item>
              <ion-item>
                <ion-label>Asset 2</ion-label>
              </ion-item>
            </ion-list>
          </section>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle,
  IonSegment, IonSegmentButton, IonLabel, IonContent, IonList, IonItem
} from '@ionic/vue';

// Use a ref to track the active segment; defaulting to 'activity'
const segment = ref('activity');
</script>

<style scoped>
.dashboard-container {
  padding: 16px;
}

.activity-section,
.assets-section {
  margin-top: 16px;
}
</style>
