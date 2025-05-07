<template>
  <BaseLayout>
    <ion-content :fullscreen="true">
      <div class="dashboard-container">
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
            <p>Balance: {{ accountBalance }} SYS</p>
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
          <!-- Open AddTokenModal -->
          <ion-button expand="block" @click="openAddTokenModal">Import Token</ion-button>
          <ion-list>
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
        </template>
      </div>
    </ion-content>
  </BaseLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getSeedPhrase } from '@/utils/secureStorage/seed';
import { fetchTokenBalance, getAccountDetails } from '../../../../packages/wallet-core/ethereum/ethereumUtils';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  toastController,
  modalController
} from '@ionic/vue';
import { getProvider } from '@/utils/networkUtils';
import SendAssetsModal from "@/components/SendAssetsModal.vue";
import AddTokenModal from '@/components/AddTokenModal.vue';
import { getImportedTokens, removeImportedToken } from '@/utils/tokenUtils';
import BaseLayout from "@/layouts/BaseLayout.vue";
import { copyOutline } from "ionicons/icons";

const tokens = ref<Array<{ address: string; symbol: string; name: string; decimals: number; balance: string }>>([]);

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
      const provider = await getProvider();
      const { address, privateKey, balance } = await getAccountDetails(mnemonic, provider);
      accountAddress.value = address;
      accountPrivateKey.value = privateKey;
      accountBalance.value = balance !== null ? balance : 'Error fetching balance';
      await loadTokens();
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
    component: AddTokenModal
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
.dashboard-container {
  padding: 16px;
}

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
