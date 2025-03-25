<template>
  <ion-page>
    <ion-header>
      <!-- Primary toolbar with title -->
      <!-- TODO Settings View and button-->
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
            <p>Your Account: {{ accountAddress }}</p>
          </ion-card-content>
        </ion-card>
        <!-- Card to display the private key -->
        <!-- TODO Hide it in Settings view and ask for password to retrieve it-->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Private Key</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>{{ accountPrivateKey }}</p>
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
import { ref, onMounted } from 'vue';
import { getSeedPhrase } from '@/utils/secureStorage/seed';
import { getFirstAccountAndPrivateKeyFromMnemonic } from '../../../../packages/wallet-core/ethereum/ethereumUtils';
import {
  IonPage, IonHeader, IonToolbar, IonTitle,
  IonSegment, IonSegmentButton, IonLabel, IonContent, IonList, IonItem
} from '@ionic/vue';

// Use a ref to track the active segment; defaulting to 'activity'
const segment = ref('activity');

// Refs to store the derived address and private key
const accountAddress = ref('Loading...');
const accountPrivateKey = ref('Loading...');

onMounted(async () => {
  try {
    const mnemonic = await getSeedPhrase();
    if (mnemonic) {
      const { address, privateKey } = getFirstAccountAndPrivateKeyFromMnemonic(mnemonic);
      accountAddress.value = address;
      accountPrivateKey.value = privateKey;
    } else {
      accountAddress.value = 'Mnemonic not found';
      accountPrivateKey.value = 'Mnemonic not found';
    }
  } catch (error) {
    console.error('Error fetching seed phrase:', error);
    accountAddress.value = 'Error fetching account';
    accountPrivateKey.value = 'Error fetching private key';
  }
});
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
