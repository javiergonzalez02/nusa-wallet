<template>
  <BaseLayout>
    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Account Info</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-grid class="ion-no-padding">
            <ion-row>
              <ion-col>
                <ion-item lines="none" fill="clear">
                  <ion-label>{{ accountAddress }}</ion-label>
                  <ion-button fill="clear" slot="end" size="small" @click="copyAddress">
                    <ion-icon :icon="copyOutline"/>
                  </ion-button>
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-grid>
          <p>Balance: {{ accountBalance }} {{ nativeSymbol }}</p>
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
          <ion-list v-if="transactions.length">
            <ion-item v-for="tx in transactions" :key="tx.hash" lines="inset">
              <ion-label>
                <h3>SENT {{ tx.amount }} {{ tx.symbol }} to {{ tx.to }}</h3>
                <p>{{ new Date(tx.timestamp).toLocaleString() }}</p>
                <ion-button
                    fill="clear"
                    @click="openExplorer(tx.hash)"
                    size="small"
                >
                  View on Explorer
                </ion-button>
              </ion-label>
              <!-- simple status pill -->
              <ion-badge slot="end" :color="{ pending:'medium', confirmed:'success', failed:'danger' }[tx.status]">
                {{ tx.status }}
              </ion-badge>
            </ion-item>
          </ion-list>

          <ion-text v-else color="medium">
            <p>No transactions yet</p>
          </ion-text>
        </section>
      </template>
      <template v-else-if="segment === 'assets'">
        <!-- Open AddTokenModal -->
        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button @click="openAddTokenModal">
            <ion-icon :icon="add"/>
          </ion-fab-button>
        </ion-fab>
        <ion-list v-if="tokens.length">
          <ion-item v-for="token in tokens" :key="token.address">
            <ion-label>
              <h2>{{ token.symbol }}</h2>
              <p>{{ token.name }} • {{ token.balance }} </p>
            </ion-label>
            <ion-button slot="end" fill="clear" @click="removeToken(token.address)">
              Remove
            </ion-button>
          </ion-item>
        </ion-list>
        <ion-text v-else color="medium">
          <p>No tokens yet. Tap the “+” button at bottom-right to add one.</p>
        </ion-text>
      </template>
    </ion-content>
  </BaseLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { getSeedPhrase } from '@/utils/secureStorage/seed';
import {
  fetchTokenBalance,
  getAddressFromMnemonic,
  getBalanceForAddress
} from '../../../../packages/wallet-core/ethereum/ethereumUtils';
import {
  IonBadge,
  IonButton,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonText,
  modalController,
  toastController
} from '@ionic/vue';
import { useNetworkStore } from '@/stores/network';
import AddToken from '@/components/AddToken.vue';
import { getImportedTokens, removeImportedToken } from '@/utils/tokenUtils';
import BaseLayout from "@/layouts/BaseLayout.vue";
import { add, copyOutline } from "ionicons/icons";
import { initTxHistory, registerTxHistoryWatcher, useTxHistory } from "@/utils/txHistory";
import { resumeTxWatchers } from '@/utils/watchTx';
import { watchBalance } from '@/utils/watchBalance';
import { formatEther } from "ethers";
import { useAccountStore } from "@/stores/accountStore";
import { useOnNetworkChange } from '@/composables/useOnNetworkChange';
import { watchTokenBalances } from "@/utils/watchTokenBalance";

// Track imported tokens
const tokens = ref<Array<{ address: string; symbol: string; name: string; decimals: number; balance: string }>>([]);
// Use a ref to track the active segment; defaulting to 'activity'
const segment = ref('activity');

// Refs to store account details and balance
const accountAddress = ref('Loading...');
const accountBalance = ref('Loading...');
// Reactive transaction history
const transactions = useTxHistory();
const net = useNetworkStore();
// Compute provider from network
let provider = computed(() => net.provider);
// Compute block explorer base URL
const blockExplorerBase = computed(() => net.selectedInfo.blockExplorer);
// Compute native symbol from network
const nativeSymbol = computed(() => net.selectedInfo.nativeSymbol);
// Store loaded mnemonic and balance watcher stopper
let mnemonic = '';
let stopNativeBalanceWatch: (() => void) | undefined;
let stopTokenWatch: (() => void) | undefined;

// Initialize component on mount
onMounted(async() => {
  // Load seed phrase
  mnemonic = (await getSeedPhrase()) ?? '';
  // Fetch account address
  accountAddress.value = getAddressFromMnemonic(mnemonic);
  // Wait for network store to be ready before loading data
  await waitForNetworkReady();
  // Load persisted tx history
  await initTxHistory();
  // Watch for network changes in tx history
  registerTxHistoryWatcher();
});

// Refresh UI on network change
useOnNetworkChange(refreshForNetwork);

// Cleanup on unmount
onUnmounted(() => {
  // Stop balance watchers
  stopNativeBalanceWatch?.();
  stopTokenWatch?.();
});

/**
 * Refresh account data when network changes
 */
async function refreshForNetwork() {
  try {
    // Ensure mnemonic is available
    if (!mnemonic) throw new Error('Seed phrase missing');
    // Fetch account balance
    const balance = await getBalanceForAddress(mnemonic, provider.value);
    accountBalance.value = balance ?? '0';
    // Update global account store
    useAccountStore().setAccount(accountAddress.value);
    // Reload token balances
    await loadTokens();
    // Restart native balance watcher
    stopNativeBalanceWatch?.();
    stopNativeBalanceWatch = await watchBalance(
        accountAddress.value,
        (wei) => {
          accountBalance.value = formatEther(wei);
        }
    );
    // Restart ERC-20 balance watcher
    stopTokenWatch?.();
    const imported = await getImportedTokens();
    stopTokenWatch = await watchTokenBalances(
        accountAddress.value,
        imported,
        (balances) => {
          tokens.value = tokens.value.map(t => ({
            ...t,
            balance: balances[t.address] ?? t.balance
          }));
        }
    );
    // Resume pending tx watchers
    await resumeTxWatchers();
  } catch (err) {
    console.error(err);
    // Display error state
    accountAddress.value = 'Error';
    accountBalance.value = 'Error';
  }
}

/**
 * Waits until the network flag ready is set to true
 */
async function waitForNetworkReady() {
  while (!net.ready) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * Copy account address to clipboard
 */
async function copyAddress() {
  try {
    await navigator.clipboard.writeText(accountAddress.value);
    await toast('Address copied to clipboard');
  } catch {
    await toast('Copy failed', 'danger');
  }
}

/**
 * Load ERC-20 token balances for the current account
 */
async function loadTokens() {
  tokens.value = [];
  const account = accountAddress.value;
  // Get user-imported tokens
  const imported = await getImportedTokens();
  for (const t of imported) {
    // Fetch and store each token's balance
    const balance = await fetchTokenBalance(t.address, account, provider.value, t.decimals);
    tokens.value.push({ ...t, balance });
  }
}

/**
 * Open modal to add a new token
 */
const openAddTokenModal = async() => {
  const modal = await modalController.create({ component: AddToken });
  // Reload tokens after modal closes
  modal.onDidDismiss().then(() => loadTokens());
  await modal.present();
};

/**
 * Remove a token and reload list
 */
async function removeToken(addr: string) {
  await removeImportedToken(addr);
  await loadTokens();
}

/**
 * Open transaction on block explorer
 */
function openExplorer(txHash: string) {
  if (!blockExplorerBase.value) {
    alert('Set a block explorer for this chain in order to view the tx.');
    return;
  }
  const url = `${blockExplorerBase.value}/tx/${txHash}`;
  window.open(url, '_blank', 'noopener');
}

/**
 * Show a toast message
 */
async function toast(msg: string, color: string = 'primary') {
  const t = await toastController.create({ message: msg, duration: 2000, color });
  await t.present();
}
</script>

<style scoped>
.activity-section {
  margin-top: 16px;
}

/* Match ion-item background to its parent ion-card */
ion-card ion-item {
  --background: var(--ion-card-background);
  --background-ios: var(--ion-card-background);
  --background-md: var(--ion-card-background);
}
</style>
