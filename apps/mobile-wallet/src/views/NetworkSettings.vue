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

        <!-- Editable Network Fields -->
        <ion-item>
          <ion-label position="stacked">Label</ion-label>
          <ion-input
              v-model="tempOverrides.label"
              :placeholder="defaultNetwork.label"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Chain ID</ion-label>
          <ion-input
              v-model.number="tempOverrides.chainId"
              type="number"
              :placeholder="defaultNetwork.chainId.toString()"
          />
          <ion-note v-if="chainIdError" color="danger" class="ion-padding-start">
            {{ chainIdError }}
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Native Symbol</ion-label>
          <ion-input
              v-model="tempOverrides.nativeSymbol"
              :placeholder="defaultNetwork.nativeSymbol"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">RPC URL</ion-label>
          <ion-input
              v-model="tempRpcUrl"
              :placeholder="defaultNetwork.rpcUrl"
              type="url"
          />
          <ion-note v-if="rpcError" color="danger" class="ion-padding-start">
            {{ rpcError }}
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Block Explorer URL</ion-label>
          <ion-input
              v-model="tempOverrides.blockExplorer"
              :placeholder="defaultNetwork.blockExplorer"
          />
        </ion-item>

        <!-- Save button, enabled only when changed -->
        <ion-item>
          <ion-button
              expand="block"
              @click="saveOverrides"
              :disabled="!hasChanges"
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
import { getCustomNetworkOverrides, setCustomNetworkOverride } from '@/utils/networkRpcUtils';
import type { NetworkKey, NetworkInfo } from '../../../../packages/wallet-core/ethereum/network';
import { NETWORK_LIST, getNetworkInfo } from '../../../../packages/wallet-core/ethereum/network';
import { computed, onMounted, ref, watchEffect } from 'vue';

const networks = NETWORK_LIST;

const network = ref<NetworkKey>('syscoin');
const customOverrides = ref<Partial<Record<NetworkKey, Partial<NetworkInfo>>>>({});
const tempOverrides = ref<Partial<NetworkInfo>>({});
const chainIdError = ref<string>('');
const tempRpcUrl = ref<string>('');
const rpcError = ref<string>('');

const defaultNetwork = computed(() => getNetworkInfo(network.value));

const defaultRpcUrl = computed(() => defaultNetwork.value.rpcUrl);

// URL validation helper
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Update hasChanges computation
const hasChanges = computed(() => {
  const current = customOverrides.value[network.value] || {};
  const currentRpc = current.rpcUrl || '';
  const tempRpc = tempRpcUrl.value.trim();

  // Check if RPC changed
  const rpcChanged = tempRpc !== currentRpc &&
      tempRpc !== defaultRpcUrl.value;

  // Check other properties with proper type safety
  const otherChanged = Object.keys(tempOverrides.value)
      .filter(k => k !== 'rpcUrl')
      .some(key => {
        const typedKey = key as keyof NetworkInfo;
        return tempOverrides.value[typedKey] !== current[typedKey];
      });

  return (rpcChanged || otherChanged) && !rpcError.value;
});


onMounted(async() => {
  // load the saved selection
  network.value = await getSelectedNetwork();
  // load any overrides
  customOverrides.value = await getCustomNetworkOverrides();
  // seed tempRpc with the current value or empty
  tempOverrides.value = { ...customOverrides.value[network.value] };
});

async function onNetworkChange() {
  // persist the new network
  await setSelectedNetwork(network.value);
  // refresh the tempRpc field
  tempOverrides.value = { ...customOverrides.value[network.value] };
}

// Update save handler
async function saveOverrides() {
  const cleaned: Partial<NetworkInfo> = {
    ...tempOverrides.value,
    rpcUrl: tempRpcUrl.value.trim() || undefined
  };

  // Validate RPC URL
  if (cleaned.rpcUrl && !isValidUrl(cleaned.rpcUrl)) {
    rpcError.value = 'Invalid URL format';
    return;
  }

  // Clear RPC URL if it matches default
  if (cleaned.rpcUrl === defaultRpcUrl.value) {
    delete cleaned.rpcUrl;
  }

  // Update storage
  await setCustomNetworkOverride(network.value, cleaned);

  // Reset state
  customOverrides.value = await getCustomNetworkOverrides();
  tempRpcUrl.value = '';
  rpcError.value = '';
}

</script>
