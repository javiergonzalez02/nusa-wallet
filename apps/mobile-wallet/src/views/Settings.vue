<template>
  <BaseLayout>
    <ion-content>
      <ion-list :inset="true" lines="none">
        <!-- Network selector -->
        <ion-item>
          <ion-select
              v-model="network"
              @ionChange="onNetworkChange"
              label="Network"
              placeholder="Select network"
              label-placement="floating"
          >
            <ion-select-option
                v-for="n in networks"
                :key="n.value"
                :value="n.value"
            >
              {{ n.label }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <!-- Custom RPC inputs -->
        <ion-item
            v-for="n in networks"
            :key="n.value"
        >
          <ion-label position="stacked">
            {{ n.label }} RPC URL
          </ion-label>
          <ion-input
              v-model="customRpcUrls[n.value]"
              :placeholder="defaultUrls[n.value]"
              @ionBlur="onRpcUrlChange(n.value)"
          />
        </ion-item>
        <ion-item>
          <!-- Define button with unique ID to trigger deletion alert -->
          <ion-button id="confirm-delete">
            Delete Seed Phrase
          </ion-button>
        </ion-item>
        <ion-item>
          <!-- Define button to retrieve Mnemonic Phrase -->
          <ion-button @click="getMnemonic">
            Get Seed
          </ion-button>
        </ion-item>
        <ion-item>
          <!-- Invoke logout handler on click -->
          <ion-button @click="logOut">
            Log out
          </ion-button>
        </ion-item>
      </ion-list>
      <!-- Configure alert triggered by the 'confirm-delete' button to confirm deletion -->
      <ion-alert
          trigger="confirm-delete"
          header="Confirm Delete"
          message="Are you sure you want to delete your seed phrase?"
          :buttons="alertButtons"
      ></ion-alert>
    </ion-content>
  </BaseLayout>
</template>

<script lang="ts" setup>
import {
  IonAlert,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonInput
} from '@ionic/vue';
import { getSeedPhrase, removeSeedPhrase } from '@/utils/secureStorage/seed';
import { useRouter } from "vue-router";
import BaseLayout from "@/layouts/BaseLayout.vue";
import { ref, onMounted } from 'vue';
import {
  getSelectedNetwork,
  setSelectedNetwork,
} from '@/utils/networkUtils';
import { getCustomRpcUrls, setCustomRpcUrl } from '@/utils/networkRpcUtils';
import type { EvmNetwork } from '../../../../packages/wallet-core/ethereum/network';
import { DEFAULT_RPC_URLS } from '../../../../packages/wallet-core/ethereum/network';

const networks = [
  { value: 'syscoin', label: 'Syscoin NEVM' },
  { value: 'syscoinTestnet', label: 'Syscoin NEVM Testnet' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'polygon', label: 'Polygon' },
] as const;

// reactive state
const customRpcUrls = ref<Partial<Record<EvmNetwork, string>>>({});
const defaultUrls = DEFAULT_RPC_URLS;
const router = useRouter();
const network = ref<EvmNetwork>('syscoin');

onMounted(async() => {
  // load selected network
  network.value = await getSelectedNetwork();
  // load any overrides
  Object.assign(customRpcUrls, await getCustomRpcUrls());
});

async function onNetworkChange() {
  await setSelectedNetwork(network.value);
}

async function onRpcUrlChange(net: EvmNetwork) {
  const url = customRpcUrls.value[net] ?? '';
  await setCustomRpcUrl(net, url);
}

// Define alert buttons with designated roles and handlers
const alertButtons = [
  {
    text: 'Cancel',
    role: 'cancel',
    handler: () => {
      console.log('Deletion canceled'); // Log cancellation action
    },
  },
  {
    text: 'Delete',
    role: 'confirm',
    handler: async() => {
      const seed = await getSeedPhrase();
      if (seed) {
        await removeSeedPhrase();
        console.log('Seed phrase deleted');  // Log deletion outcome
      } else {
        console.log('No seed phrase found; nothing to remove.');  // Log absence of seed phrase
      }
      await router.push({ name: 'welcome' }); // Navigate to welcome page
    },
  },
];

// Define getMnemonic function to retrieve the Mnemonic phrase
const getMnemonic = async() => {
  const seed = await getSeedPhrase();
  alert(seed);
};

// Define logOut function to navigate to the welcome page
const logOut = async() => {
  await router.push({ name: 'welcome' });
};
</script>
