<template>
  <BaseLayout>
    <ion-content class="ion-padding">
      <ion-list>
        <!-- Input for the recipient address -->
        <ion-item>
          <ion-label position="stacked">Recipient Address</ion-label>
          <ion-input v-model="recipientAddress" placeholder="0x..."></ion-input>
        </ion-item>
        <!-- Input for the transaction amount -->
        <ion-item>
          <ion-label position="stacked">Amount</ion-label>
          <ion-input v-model="amount" placeholder="Enter amount"></ion-input>
        </ion-item>
      </ion-list>
      <!-- Button to trigger sending the transaction -->
      <ion-button expand="full" @click="handleTransaction" :disabled="loading">
        <ion-spinner v-if="loading" slot="start"></ion-spinner>
        Send SYS
      </ion-button>
    </ion-content>
  </BaseLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { sendTransaction, getAccountDetails } from '../../../../packages/wallet-core/ethereum/ethereumUtils';
import { getProvider } from '@/utils/networkUtils';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  modalController,
  toastController
} from '@ionic/vue';
import BaseLayout from "@/layouts/BaseLayout.vue";
import { getSeedPhrase } from "@/utils/secureStorage/seed";

// Ref variables
const recipientAddress = ref();           // User input for recipient's address
const amount = ref();                     // User input for the amount to send
const loading = ref(false);               // Loading state during transaction process
const privateKey = ref();                 // Private key of the account

// fetch key on mount
onMounted(async() => {
  try {
    const mnemonic = await getSeedPhrase();
    if (!mnemonic) {
      alert('Seed phrase not found');
      return;
    }

    const provider = await getProvider();
    const { privateKey: pk } = await getAccountDetails(mnemonic, provider);
    privateKey.value = pk;
  } catch (err) {
    console.error(err);
    const toast = await toastController.create({
      message: 'Wallet not ready',
      duration: 2000,
      color: 'danger',
    });
    await toast.present();
  }
});

// Dismiss modal
function dismiss() {
  modalController.dismiss();
}

// Handles the transaction process
async function handleTransaction() {
  try {
    // Validate if privateKey is ready
    if (!privateKey.value || privateKey.value === 'Loading...') {
      alert('Wallet not ready. Private Key could not be retrieved');
      return;
    }
    console.log('Amount before parsing:', amount.value);
    // Check if a valid amount has been entered
    if (!amount.value) {
      alert('Please enter a valid amount.');
      return;
    }
    loading.value = true; // Set loading state

    // Format the amount (replace commas with dots for decimal representation)
    const formattedAmount = amount.value.toString().replace(',', '.');
    console.log('Amount:', formattedAmount);

    // Get provider from network utils
    const provider = await getProvider();
    // Send the transaction using the wallet utility function
    const txHash = await sendTransaction(privateKey.value, recipientAddress.value, formattedAmount, provider);
    console.log('Transaction sent:', txHash);

    // Close modal upon successful transaction
    dismiss();
  } catch (error: any) {
    console.error('Error sending transaction:', error);
    alert('Transaction failed: ' + error.message);
  } finally {
    loading.value = false; // Reset loading state after processing
  }
}
</script>
