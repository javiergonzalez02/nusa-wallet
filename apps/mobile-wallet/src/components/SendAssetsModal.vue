<template>
  <!-- Ionic Modal component to send Assets -->
  <ion-header>
    <ion-toolbar>
      <!-- Cancel button -->
      <ion-buttons slot="start">
        <ion-button @click="dismiss()">Close</ion-button>
      </ion-buttons>
      <ion-title>Send SYS</ion-title>
    </ion-toolbar>
  </ion-header>
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { sendTransaction } from '../../../../packages/wallet-core/ethereum/ethereumUtils';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  IonInput,
  modalController
} from '@ionic/vue';

// Ref variables
const recipientAddress = ref();       // User input for recipient's address
const amount = ref();                 // User input for the amount to send
const loading = ref(false);           // Loading state during transaction process

// Component props containing necessary wallet information
const props = defineProps<{
  privateKey: string;
}>();

// Dismiss modal
function dismiss() {
  modalController.dismiss();
}

// Handles the transaction process
async function handleTransaction() {
  try {
    // Validate if privateKey is ready
    if (!props.privateKey || props.privateKey === 'Loading...') {
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

    // Send the transaction using the wallet utility function
    const txHash = await sendTransaction(props.privateKey, recipientAddress.value, formattedAmount);
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
