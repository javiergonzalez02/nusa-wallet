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
import { useNetworkStore } from '@/utils/network';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  toastController
} from '@ionic/vue';
import BaseLayout from "@/layouts/BaseLayout.vue";
import { getSeedPhrase } from "@/utils/secureStorage/seed";
import { addTx } from "@/utils/txHistory";
import { trackTx } from "@/utils/watchTx";
import { getImportedTokens } from '@/utils/tokenUtils';
import QrScanner from "@/components/qrScanner.vue";
import { useOnNetworkChange } from "@/composables/useOnNetworkChange";

// Retrieve network store and derive provider and native symbol
const net = useNetworkStore();
const provider = computed(() => net.provider);
const nativeSymbol = computed(() => net.selectedInfo.nativeSymbol);

// Define reactive form fields and state
const recipientAddress = ref();           // User input for recipient's address
const amount = ref();                     // User input for the amount to send
const loading = ref(false);               // Loading state during transaction process
const privateKey = ref();                 // Private key of the account
const tokens = ref<Array<{ address: string; symbol: string; decimals: number }>>([]); // Imported tokens
const selectedAsset = ref<string>('');    // Native coin or selected token

// Load initial data on component mount
onMounted(async() => {
  await prepareForNetwork();
});

// Refresh data when network changes
useOnNetworkChange(prepareForNetwork);

/**
 * Prepare account and token data for the current network
 */
async function prepareForNetwork() {
  loading.value = true;
  try {
    // Retrieve mnemonic and derive private key
    const mnemonic = await getSeedPhrase();
    if (!mnemonic) throw new Error('Seed phrase not found');
    const { privateKey: pk } = await getAccountDetails(mnemonic, provider.value);
    privateKey.value = pk;

    // Load imported tokens
    tokens.value = await getImportedTokens();

    // Default selection to native asset
    selectedAsset.value = nativeSymbol.value;
  } catch (err) {
    console.error(err);
    await toast('Wallet not ready', 'danger');
  } finally {
    loading.value = false;
  }
}

/**
 * Compute display symbol for the selected asset
 */
const selectedSymbol = computed(() => {
  if (selectedAsset.value === nativeSymbol.value && nativeSymbol.value) {
    return nativeSymbol.value;
  }
  const token = tokens.value.find(t => t.address === selectedAsset.value);
  return token ? token.symbol : (nativeSymbol.value || 'Asset'); // Fallback if nativeSymbol isn't ready or token not found
});

/**
 * Handle QR code scan result
 * When 'scanned' event is emitted by the scanner, assign the value to the recipientAddress
 */
function onScanned(value: string | undefined) {
  if (value) {
    recipientAddress.value = value
  }
}

/**
 * Validate inputs and send transaction
 */
async function handleTransaction() {
  // Validate if privateKey is ready
  if (!privateKey.value) throw new Error('Private Key could not be retrieved');
  if (!recipientAddress.value.trim()) throw new Error('Recipient address is required.');
  const amt = parseFloat(amount.value.replace(',', '.'));
  if (isNaN(amt) || amt <= 0) throw new Error('Enter a valid positive amount');
  if (!selectedAsset.value) throw new Error('Please select an asset to send.');
  loading.value = true; // Set loading state
  try {
    // Format the amount (replace commas with dots for decimal representation)
    const formattedAmount = amount.value.toString().replace(',', '.');
    let txResp;
    let symbolForHistory = nativeSymbol.value; // Default to native symbol

    if (selectedAsset.value === nativeSymbol.value) {
      // Native coin transfer
      txResp = await sendTransaction(
          privateKey.value,
          recipientAddress.value,
          formattedAmount,
          provider.value
      );
    } else {
      // ERC-20 transfer
      const token = tokens.value.find(t => t.address === selectedAsset.value);
      if (!token) throw new Error('Token not found');
      symbolForHistory = token.symbol;
      txResp = await sendERC20(
          privateKey.value,
          token.address,
          recipientAddress.value,
          formattedAmount,
          provider.value
      );
    }

    await toast(`Tx sent! ${txResp.hash.slice(0, 10)}…`, 'success');

    // Prepare transaction record for local history
    const txRec = {
      hash: txResp.hash,
      from: txResp.from,
      to: txResp.to!,
      amount: formattedAmount,
      symbol: symbolForHistory,
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

/**
 * Show a toast notification
 */
async function toast(msg: string, color: string = 'primary') {
  const t = await toastController.create({ message: msg, duration: 2500, color });
  await t.present();
}
</script>
