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
            <ion-item v-for="tx in transactions" :key="tx.hash" lines="full">
              <ion-label>
                <h3>{{ tx.amount }} {{ nativeSymbol }} → {{ tx.to }}</h3>
                <p>{{ new Date(tx.timestamp).toLocaleString() }}</p>
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
import { onMounted, onUnmounted, ref } from 'vue';
import { getSeedPhrase } from '@/utils/secureStorage/seed';
import { fetchTokenBalance, getAccountDetails } from '../../../../packages/wallet-core/ethereum/ethereumUtils';
import {
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
  modalController,
  toastController
} from '@ionic/vue';
import { getProvider, getSelectedNetworkInfo } from '@/utils/networkUtils';
import AddToken from '@/components/AddToken.vue';
import { getImportedTokens, removeImportedToken } from '@/utils/tokenUtils';
import BaseLayout from "@/layouts/BaseLayout.vue";
import { add, copyOutline } from "ionicons/icons";
import { initTxHistory, useTxHistory } from "@/utils/txHistory";
import { resumeTxWatchers } from '@/utils/watchTx';
import { watchBalance } from '@/utils/watchBalance';
import { formatEther } from "ethers";
import { NetworkInfo } from "../../../../packages/wallet-core/ethereum/network";
import { useAccountStore } from "@/stores/accountStore";

const tokens = ref<Array<{ address: string; symbol: string; name: string; decimals: number; balance: string }>>([]);

// Use a ref to track the active segment; defaulting to 'activity'
const segment = ref('activity');

// Refs to store account details and balance
const accountAddress = ref('Loading...');
const accountPrivateKey = ref('Loading...');
const accountBalance = ref('Loading...');
const nativeSymbol = ref(''); // Reactive variable for the native currency symbol
const transactions = useTxHistory();
// Holds the disposer function for the active balance watcher, or undefined if no watcher is running
let stopBalanceWatch: (() => void) | undefined;


onMounted(async() => {
  try {
    const mnemonic = await getSeedPhrase();
    if (mnemonic) {
      // Fetch network information to get the native symbol
      const networkInfo: NetworkInfo = await getSelectedNetworkInfo();
      nativeSymbol.value = networkInfo.nativeSymbol;
      // Provider for the selected network
      const provider = await getProvider();
      const { address, privateKey, balance } = await getAccountDetails(mnemonic, provider);
      accountAddress.value = address;
      accountPrivateKey.value = privateKey;
      accountBalance.value = balance !== null ? balance : 'Error fetching balance';
      useAccountStore().setAccount(address);
      await loadTokens();
      await initTxHistory();     // load + make reactive
      await resumeTxWatchers();  // restart any pending watchers
      // Start watching the on‑chain balance of the account
      stopBalanceWatch = await watchBalance(
          accountAddress.value,
          (wei) => {
            // Update the reactive balance when a new block arrives
            accountBalance.value = formatEther(wei);
          }
      );
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

onUnmounted(() => {
  // Stop watching balance when the component is destroyed
  if (stopBalanceWatch) stopBalanceWatch();
});

const copyAddress = async() => {
  try {
    await navigator.clipboard.writeText(accountAddress.value);
    const toast = await toastController.create({
      message: 'Address copied to clipboard',
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  } catch (err) {
    console.error('Copy failed', err);
    const toast = await toastController.create({
      message: 'Failed to copy address',
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }
};

async function loadTokens() {
  tokens.value = [];
  const provider = await getProvider();
  const account = accountAddress.value;
  const imported = await getImportedTokens();
  for (const t of imported) {
    const balance = await fetchTokenBalance(t.address, account, provider, t.decimals);
    tokens.value.push({ ...t, balance });
  }
}

const openAddTokenModal = async() => {
  const modal = await modalController.create({
    component: AddToken
  });
  modal.onDidDismiss().then(() => loadTokens());
  await modal.present();
};

async function removeToken(addr: string) {
  await removeImportedToken(addr);
  await loadTokens();
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
