<template>
  <BaseLayout>
    <ion-content :fullscreen="true">
      <div class="dashboard-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Account Info</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>Your Account: {{ accountAddress }}</p>
            <p>Balance: {{ accountBalance }} SYS</p>
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
        <!-- Open SendAssetsModal -->
        <ion-button id="open-modal" expand="block" @click="openSendModal">Send</ion-button>
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
  </BaseLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getSeedPhrase } from '@/utils/secureStorage/seed';
import { getAccountDetails } from '../../../../packages/wallet-core/ethereum/ethereumUtils';
import { IonContent, IonItem, IonLabel, IonList, IonSegment, IonSegmentButton, modalController } from '@ionic/vue';
import SendAssetsModal from "@/components/SendAssetsModal.vue";
import BaseLayout from "@/layouts/BaseLayout.vue";

// Use a ref to track the active segment; defaulting to 'activity'
const segment = ref('activity');

// Refs to store account details and balance
const accountAddress = ref('Loading...');
const accountPrivateKey = ref('Loading...');
const accountBalance = ref('Loading...');

const openSendModal = async() => {
  const modal = await modalController.create({
    component: SendAssetsModal,
    componentProps: {
      privateKey: accountPrivateKey.value
    }
  });
  await modal.present();
};

onMounted(async() => {
  try {
    const mnemonic = await getSeedPhrase();
    if (mnemonic) {
      const { address, privateKey, balance } = await getAccountDetails(mnemonic);
      accountAddress.value = address;
      accountPrivateKey.value = privateKey;
      accountBalance.value = balance !== null ? balance : 'Error fetching balance';
    } else {
      accountAddress.value = 'Mnemonic not found';
      accountPrivateKey.value = 'Mnemonic not found';
      accountBalance.value = 'Mnemonic not found';
    }
  } catch (error) {
    console.error('Error fetching seed phrase:', error);
    accountAddress.value = 'Error fetching account';
    accountPrivateKey.value = 'Error fetching private key';
    accountBalance.value = 'Error fetching balance';
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
