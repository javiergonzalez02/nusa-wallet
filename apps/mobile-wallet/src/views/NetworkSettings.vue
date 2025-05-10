<template>
  <BaseLayout showBack title="Network Settings" defaultHref="/tabs/settings">
    <ion-content>
      <ion-list inset lines="none">
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
              :key="n.key"
              :value="n.key"
            >
              {{ n.label }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Selected network’s custom-RPC input -->
        <ion-item>
          <ion-label position="stacked">
            {{ selectedLabel }} RPC URL
          </ion-label>
          <!-- bind to tempRpc, not customRpcUrls[...] -->
          <ion-input
            v-model="tempRpc"
            :placeholder="defaultUrl(network)"
          />
        </ion-item>

        <!-- Save button, enabled only when changed -->
        <ion-item>
          <ion-button
            expand="block"
            @click="saveRpc"
            :disabled="tempRpc === currentSavedRpc"
          >
            Save
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </BaseLayout>
</template>

<script lang="ts" setup>
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, } from '@ionic/vue';
import BaseLayout from '@/layouts/BaseLayout.vue';
import { getSelectedNetwork, setSelectedNetwork, } from '@/utils/networkUtils';
import { getCustomRpcUrls, setCustomRpcUrl, } from '@/utils/networkRpcUtils';
import type { NetworkKey } from '../../../../packages/wallet-core/ethereum/network';
import { NETWORK_LIST, getNetworkInfo } from '../../../../packages/wallet-core/ethereum/network';
import { computed, onMounted, ref } from 'vue';

const networks = NETWORK_LIST;

const network = ref<NetworkKey>('syscoin');
const customRpcUrls = ref<Partial<Record<NetworkKey, string>>>({});
const tempRpc = ref<string>('');

onMounted(async () => {
  // load the saved selection
  network.value = await getSelectedNetwork();
  // load any overrides
  Object.assign(customRpcUrls.value, await getCustomRpcUrls());
  // seed tempRpc with the current value or empty
  tempRpc.value = customRpcUrls.value[network.value] ?? '';
});

async function onNetworkChange() {
  // persist the new network
  await setSelectedNetwork(network.value);
  // refresh the tempRpc field
  tempRpc.value = customRpcUrls.value[network.value] ?? '';
}

const currentSavedRpc = computed(() => {
  return customRpcUrls.value[network.value] ?? '';
});

async function saveRpc() {
  // write into custom RPC map and persist
  customRpcUrls.value[network.value] = tempRpc.value;
  await setCustomRpcUrl(network.value, tempRpc.value);
}

function defaultUrl(key: NetworkKey): string {
  return getNetworkInfo(key).rpcUrls[0];
}

const selectedLabel = computed(() => getNetworkInfo(network.value).label);
</script>
