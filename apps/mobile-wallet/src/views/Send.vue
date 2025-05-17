<template>
  <BaseLayout>
    <ion-content class="ion-padding">
      <ion-list>
        <!-- Asset selector -->
        <ion-item>
          <ion-select
              label="Select Asset"
              label-placement="floating"
              interface="popover"
              :value="nativeSymbol"
              v-model="selectedAsset"
          >
            <!-- Lists native coin -->
            <ion-select-option :value="nativeSymbol">{{ nativeSymbol }}</ion-select-option>
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
          <ion-input v-model="recipientAddress" placeholder="0x...">
            <qrScanner
            slot="end"
            @scanned="onScanned"/>
          </ion-input>
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
import { getProvider, getSelectedNetworkInfo } from '@/utils/networkUtils';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, toastController } from '@ionic/vue';
import BaseLayout from "@/layouts/BaseLayout.vue";
import { getSeedPhrase } from "@/utils/secureStorage/seed";
import { addTx } from "@/utils/txHistory";
import { trackTx } from "@/utils/watchTx";
import { getImportedTokens } from '@/utils/tokenUtils';
import { NetworkInfo } from "../../../../packages/wallet-core/ethereum/network";
import QrScanner from "@/components/qrScanner.vue";

// Ref variables
const recipientAddress = ref();           // User input for recipient's address
const amount = ref();                     // User input for the amount to send
const loading = ref(false);               // Loading state during transaction process
const privateKey = ref();                 // Private key of the account
const nativeSymbol = ref('');             // Reactive variable for the native currency symbol
const tokens = ref<Array<{ address: string; symbol: string; decimals: number }>>([]);
const selectedAsset = ref<string>('');    // Native coin or selected token

// fetch key and token list on mount
onMounted(async() => {
  loading.value = true;
  try {
    // Fetch network information to get the native symbol
    const networkInfo: NetworkInfo = await getSelectedNetworkInfo();
    nativeSymbol.value = networkInfo.nativeSymbol;
    selectedAsset.value = networkInfo.nativeSymbol; // Default selected asset to the native currency

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
  } finally {
    loading.value = false;
  }
});

// Computes the display symbol:
// returns the native asset if is selected; otherwise returns the matching token’s symbol or ‘Token’.
const selectedSymbol = computed(() => {
  if (selectedAsset.value === nativeSymbol.value && nativeSymbol.value) {
    return nativeSymbol.value;
  }
  const token = tokens.value.find(t => t.address === selectedAsset.value);
  return token ? token.symbol : (nativeSymbol.value || 'Asset'); // Fallback if nativeSymbol isn't ready or token not found
});

// When 'scanned' event is emitted by the scanner, assign the value to the recipientAddress
function onScanned(value: string | undefined) {
  if (value) {
    recipientAddress.value = value
  }
}

// Handles the transaction process
async function handleTransaction() {
  // Validate if privateKey is ready
  if (!privateKey.value || privateKey.value === 'Loading...') throw new Error('Private Key could not be retrieved');
  if (!recipientAddress.value.trim()) throw new Error('Recipient address is required.');
  if (!amount.value || isNaN(parseFloat(amount.value.toString().replace(',', '.'))) || parseFloat(amount.value.toString().replace(',', '.')) <= 0) {
    throw new Error('Please enter a valid positive amount.');
  }
  if (!selectedAsset.value) throw new Error('Please select an asset to send.');
  loading.value = true; // Set loading state
  try {
    // Format the amount (replace commas with dots for decimal representation)
    const formattedAmount = amount.value.toString().replace(',', '.');

    // Get provider from network utils
    const provider = await getProvider();

    let txResp;
    let transactionSymbolForHistory = nativeSymbol.value; // Default to native symbol

    if (selectedAsset.value === nativeSymbol.value) {
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
      transactionSymbolForHistory = token.symbol;
      txResp = await sendERC20(
          privateKey.value,
          token.address,
          recipientAddress.value,
          formattedAmount,
          provider
      );
    }

    console.log('Transaction sent:', txResp);
    const toast = await toastController.create({
      message: `Transaction sent successfully! Hash: ${txResp.hash.substring(0, 10)}...`,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();

    // Prepare transaction record for local history
    const txRec = {
      hash: txResp.hash,
      from: txResp.from,
      to: txResp.to!,
      amount: formattedAmount,
      token: transactionSymbolForHistory,
      timestamp: Date.now(),
      status: 'pending' as const
    };
    addTx(txRec);           // Add to local history for instant UI update
    trackTx(txRec.hash);  // Start watching the transaction status on-chain

    // Clear input fields after successful transaction
    recipientAddress.value = '';
    amount.value = '';
  } catch (error: any) {
    console.error('Error sending transaction:', error);
    alert('Transaction failed: ' + error.message);
  } finally {
    loading.value = false; // Reset loading state after processing
  }
}
</script>
