<template>
  <!-- Modal header with title and cancel button -->
  <ion-header>
    <ion-toolbar color="primary">
      <ion-title>Import Token</ion-title>
      <ion-buttons slot="end">
        <!-- Emit 'dismiss' event when clicked to close the modal -->
        <ion-button @click="dismiss()">Cancel</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <!-- Input field for the token contract address -->
    <ion-item>
      <ion-label position="stacked">Token Contract Address</ion-label>
      <ion-input
          v-model="tokenAddress"
          placeholder="0x..."
      />
    </ion-item>

    <!-- Import button, disabled until the address is valid -->
    <ion-button
        expand="block"
        :disabled="!isValid"
        @click="importToken"
    >
      Import
    </ion-button>
  </ion-content>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonInput,
  modalController
} from '@ionic/vue';
import { getProvider } from '@/utils/networkUtils';
import { fetchTokenMetadata } from '../../../../packages/wallet-core/ethereum/ethereumUtils';
import { addImportedToken } from '@/utils/tokenUtils';
import { isAddress } from 'ethers';

const tokenAddress = ref('');

const isValid = computed(() =>
    isAddress(tokenAddress.value.trim())
);

// Dismiss modal
function dismiss() {
  modalController.dismiss();
}

const importToken = async() => {
  const provider = await getProvider();
  try {
    // Retrieve name, symbol, decimals from the ERC-20 contract
    const meta = await fetchTokenMetadata(tokenAddress.value, provider);

    // Save the token locally for the current network
    await addImportedToken({
      address: tokenAddress.value,
      ...meta
    });

    // Dismiss the modal
    await modalController.dismiss();
  } catch (err) {
    console.error('Failed to import token', err);
    alert('Failed to import token');
  }
};
</script>

