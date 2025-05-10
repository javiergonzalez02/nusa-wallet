<template>
  <BaseLayout>
    <ion-content class="ion-padding">
      <ion-list>
        <!-- Asset selector -->
        <ion-item>
          <ion-select label="Select Asset" label-placement="floating" v-model="selectedAsset">
            <!-- Lists native coin -->
            <ion-select-option value="SYS">SYS</ion-select-option>
            <!-- Lists imported ERC‑20 tokens -->
            <ion-select-option
                v-for="t in tokens"
                :key="t.address"
                :value="t.address"
            >
              {{ t.symbol }}
            </ion-select-option>
          </ion-select>
        </ion-item>
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
        Send {{ selectedSymbol }}
      </ion-button>
    </ion-content>
  </BaseLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getAccountDetails, sendERC20, sendTransaction } from '../../../../packages/wallet-core/ethereum/ethereumUtils';
import { getProvider } from '@/utils/networkUtils';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, toastController } from '@ionic/vue';
import BaseLayout from "@/layouts/BaseLayout.vue";
import { getSeedPhrase } from "@/utils/secureStorage/seed";
import { addTx } from "@/utils/txHistory";
import { trackTx } from "@/utils/watchTx";
import { getImportedTokens } from '@/utils/tokenUtils';

// Ref variables
const recipientAddress = ref();           // User input for recipient's address
const amount = ref();                     // User input for the amount to send
const loading = ref(false);               // Loading state during transaction process
const privateKey = ref();                 // Private key of the account
const tokens = ref<Array<{ address: string; symbol: string; decimals: number }>>([]);
const selectedAsset = ref<'SYS' | string>('SYS');      // Native coin or token addr

// fetch key and token list on mount
onMounted(async() => {
  try {
    const mnemonic = await getSeedPhrase();
    if (!mnemonic) throw new Error('Seed phrase not found');
    const provider = await getProvider();
    const { privateKey: pk } = await getAccountDetails(mnemonic, provider);
    privateKey.value = pk;
    tokens.value = await getImportedTokens();
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

// Computes the display symbol:
// returns ‘SYS’ if the native asset is selected; otherwise returns the matching token’s symbol or ‘Token’.
const selectedSymbol = computed(() => {
  if (selectedAsset.value === 'SYS') return 'SYS';
  const t = tokens.value.find(t => t.address === selectedAsset.value);
  return t ? t.symbol : 'Token';
});

// Handles the transaction process
async function handleTransaction() {
  try {
    // Validate if privateKey is ready
    if (!privateKey.value || privateKey.value === 'Loading...') throw new Error('Private Key could not be retrieved');
    console.log('Amount before parsing:', amount.value);
    // Check if a valid amount has been entered
    if (!amount.value) throw new Error('Please enter a valid amount.');
    loading.value = true; // Set loading state

    // Format the amount (replace commas with dots for decimal representation)
    const formattedAmount = amount.value.toString().replace(',', '.');
    console.log('Amount:', formattedAmount);

    // Get provider from network utils
    const provider = await getProvider();

    let txResp;
    let symbol = 'SYS';

    if (selectedAsset.value === 'SYS') {
      // Native coin transfer
      txResp = await sendTransaction(
          privateKey.value,
          recipientAddress.value,
          formattedAmount,
          provider
      );
    } else {
      // ERC-20 transfer
      const token = tokens.value.find(t => t.address === selectedAsset.value);
      if (!token) throw new Error('Token not found');

      symbol = token.symbol;

      txResp = await sendERC20(
          privateKey.value,
          token.address,
          recipientAddress.value,
          formattedAmount,
          provider
      );
    }

    console.log('Transaction sent:', txResp);

    const txRec = {
      hash: txResp.hash,
      from: txResp.from,
      to: txResp.to!,
      amount: formattedAmount,
      token: symbol,
      timestamp: Date.now(),
      status: 'pending' as const
    };
    addTx(txRec);          // instant UI update
    trackTx(txRec.hash);

    // UI clean‑up
    loading.value = false;
  } catch (error: any) {
    console.error('Error sending transaction:', error);
    alert('Transaction failed: ' + error.message);
  } finally {
    loading.value = false; // Reset loading state after processing
  }
}
</script>
