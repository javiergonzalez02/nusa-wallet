<template>
  <BaseLayout showBack title="Network Settings" defaultHref="/tabs/settings">
    <ion-content>
      <ion-list inset lines="none">
        <!-- Network selector -->
        <ion-item>
          <ion-select
              v-model="selectedNetwork"
              @ionChange="onNetworkChange"
              label="Network"
              placeholder="Select network"
              label-placement="floating"
          >
            <ion-select-option
                v-for="n in allNetworks"
                :key="n.key"
                :value="n.key"
            >
              {{ n.label }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Add Custom Network Button -->
        <ion-item>
          <ion-button expand="block" @click="openAddNetworkModal">
            Add Custom Network
          </ion-button>
        </ion-item>

        <!-- Editable Network Fields -->
        <ion-item v-if="isPredefined">
          <ion-label position="stacked">Label</ion-label>
          <ion-input
              v-model="tempOverrides.label"
              :placeholder="defaultNetwork.label"
          />
        </ion-item>
        <ion-item v-if="isPredefined">
          <ion-label position="stacked">Chain ID</ion-label>
          <ion-input
              v-model.number="tempOverrides.chainId"
              type="number"
              :placeholder="defaultNetwork.chainId.toString()"
          />
        </ion-item>
        <ion-item v-if="isPredefined">
          <ion-label position="stacked"> Native Symbol</ion-label>
          <ion-input
              v-model="tempOverrides.nativeSymbol"
              :placeholder="defaultNetwork.nativeSymbol"
          />
        </ion-item>
        <ion-item v-if="isPredefined">
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
        <ion-item v-if="isPredefined">
          <ion-label position="stacked">Block Explorer URL</ion-label>
          <ion-input
              v-model="tempOverrides.blockExplorer"
              :placeholder="defaultNetwork.blockExplorer"
          />
        </ion-item>

        <!-- Custom Network Editing -->
        <template v-if="isCustom && tempCustomNetwork">
          <ion-item>
            <ion-label position="stacked">Label</ion-label>
            <ion-input v-model="tempCustomNetwork.label"/>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Chain ID</ion-label>
            <ion-input :value="tempCustomNetwork.chainId"/>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Native Symbol</ion-label>
            <ion-input v-model="tempCustomNetwork.nativeSymbol"/>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">RPC URL</ion-label>
            <ion-input v-model="tempCustomNetwork.rpcUrl" type="url"/>
            <ion-note v-if="rpcError" color="danger" class="ion-padding-start">
              {{ rpcError }}
            </ion-note>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Block Explorer URL</ion-label>
            <ion-input v-model="tempCustomNetwork.blockExplorer"/>
          </ion-item>
        </template>

        <!-- Save and Delete Buttons -->
        <ion-item>
          <div>
            <ion-button
                v-if="isCustom && tempCustomNetwork"
                color="danger"
                @click="removeCustomNetwork"
            >
              Delete Network
            </ion-button>
            <ion-button
                @click="saveChanges"
                :disabled="!hasChanges"
            >
              Save
            </ion-button>
          </div>
        </ion-item>
      </ion-list>
    </ion-content>
  </BaseLayout>
</template>

<script lang="ts" setup>
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  modalController,
} from '@ionic/vue';
import BaseLayout from '@/layouts/BaseLayout.vue';
import { getAllNetworkList, getSelectedNetwork, setSelectedNetwork } from '@/utils/networkUtils';
import { getCustomNetworkOverrides, setCustomNetworkOverride } from '@/utils/networkRpcUtils';
import { addCustomNetwork, deleteCustomNetwork, getCustomNetworks, updateCustomNetwork } from '@/utils/customNetwork';
import type { NetworkInfo, NetworkKey } from '../../../../packages/wallet-core/ethereum/network';
import { getNetworkInfo, NETWORK_LIST } from '../../../../packages/wallet-core/ethereum/network';
import { computed, onMounted, ref } from 'vue';
import CreateCustomNetwork from "@/components/CreateCustomNetwork.vue";

// Initialize reactive references for network data
const selectedNetwork = ref<string>('syscoin');
const allNetworks = ref<NetworkInfo[]>([]);
const customOverrides = ref<Partial<Record<string, Partial<NetworkInfo>>>>({});
const tempOverrides = ref<Partial<NetworkInfo>>({});
const tempRpcUrl = ref<string>('');
const rpcError = ref<string>('');
const tempCustomNetwork = ref<NetworkInfo | null>(null);
// Compute whether the selected network is predefined
const isPredefined = computed(() => NETWORK_LIST.some(n => n.key === selectedNetwork.value));
// Retrieve default network information
const defaultNetwork = computed((): NetworkInfo => {
  if (isPredefined.value) {
    return getNetworkInfo(selectedNetwork.value as NetworkKey);
  }
  return {} as NetworkInfo;
});
// Compute whether the selected network is custom
const isCustom = computed(() => !isPredefined.value);
// Compute the default RPC URL
const defaultRpcUrl = computed(() => defaultNetwork.value.rpcUrl || '');

// Determine if there are unsaved changes
const hasChanges = computed(() => {
  if (isPredefined.value) {
    const current = customOverrides.value[selectedNetwork.value] || {};
    const currentRpc = current.rpcUrl || '';
    const tempRpc = tempRpcUrl.value.trim();
    const rpcChanged = tempRpc !== currentRpc && tempRpc !== defaultRpcUrl.value;
    const otherChanged = Object.keys(tempOverrides.value)
        .filter((k) => k !== 'rpcUrl')
        .some((key) => tempOverrides.value[key as keyof NetworkInfo] !== current[key as keyof NetworkInfo]);
    return (rpcChanged || otherChanged) && !rpcError.value;
  } else if (isCustom.value && tempCustomNetwork.value) {
    const original = allNetworks.value.find((n) => n.key === selectedNetwork.value);
    return JSON.stringify(tempCustomNetwork.value) !== JSON.stringify(original);
  }
  return false;
});

// Validate URL format
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Load initial data on component mount
onMounted(async() => {
  // Load the saved network selection
  selectedNetwork.value = await getSelectedNetwork();
  // Load any network overrides
  customOverrides.value = await getCustomNetworkOverrides();
  // Load the list of all networks
  allNetworks.value = await getAllNetworkList();
  // Update temporary fields
  await updateTempFields();
});

// Handle network selection change
async function onNetworkChange() {
  // Persist the new network selection
  await setSelectedNetwork(selectedNetwork.value as NetworkKey);
  // Update temporary fields
  await updateTempFields();
}

// Update temporary fields based on network type
async function updateTempFields() {
  if (isPredefined.value) {
    // Set temporary overrides for predefined networks
    tempOverrides.value = { ...customOverrides.value[selectedNetwork.value] };
    tempRpcUrl.value = tempOverrides.value.rpcUrl || '';
    tempCustomNetwork.value = null;
  } else {
    // Load custom network data
    const customNetworks = await getCustomNetworks();
    const custom = customNetworks.find((n) => n.key === selectedNetwork.value);
    tempCustomNetwork.value = custom ? { ...custom } : null;
    tempRpcUrl.value = '';
  }
}

// Save network changes
async function saveChanges() {
  if (isPredefined.value) {
    // Prepare cleaned overrides for predefined networks
    const cleaned: Partial<NetworkInfo> = {
      ...tempOverrides.value,
      rpcUrl: tempRpcUrl.value.trim() || undefined,
    };
    // Validate RPC URL
    if (cleaned.rpcUrl && !isValidUrl(cleaned.rpcUrl)) {
      rpcError.value = 'Invalid URL format';
      return;
    }
    // Remove default RPC URL if unchanged
    if (cleaned.rpcUrl === defaultRpcUrl.value) {
      delete cleaned.rpcUrl;
    }
    // Save overrides
    await setCustomNetworkOverride(selectedNetwork.value as NetworkKey, cleaned);
  } else if (isCustom.value && tempCustomNetwork.value) {
    // Validate custom network RPC URL
    if (!isValidUrl(tempCustomNetwork.value.rpcUrl)) {
      rpcError.value = 'Invalid URL format';
      return;
    }
    // Update custom network
    await updateCustomNetwork(selectedNetwork.value, tempCustomNetwork.value);
  }
  // Refresh overrides and network list
  customOverrides.value = await getCustomNetworkOverrides();
  allNetworks.value = await getAllNetworkList();
  // Update temporary fields
  await updateTempFields();
  // Clear RPC error
  rpcError.value = '';
}

// Open modal to add a new custom network
async function openAddNetworkModal() {
  // Create and presents the modal
  const modal = await modalController.create({
    component: CreateCustomNetwork,
  });
  // Handle modal dismissal
  modal.onDidDismiss().then(async(result) => {
    if (result.data?.network) {
      // Add the new network
      await addNewNetwork(result.data.network);
    }
  });
  await modal.present();
}

// Add a new custom network
async function addNewNetwork(network: NetworkInfo) {
  try {
    // Save the new custom network
    await addCustomNetwork(network);
    // Refresh the network list
    allNetworks.value = await getAllNetworkList();
    // Select the new network
    selectedNetwork.value = network.key;
    // Persist the selection
    await setSelectedNetwork(network.key);
    // Update temporary fields
    await updateTempFields();
  } catch (error: any) {
    // Display error message
    alert(error.message);
  }
}

// Remove a custom network
async function removeCustomNetwork() {
  if (isCustom.value) {
    // Delete the custom network
    await deleteCustomNetwork(selectedNetwork.value);
    // Refresh the network list
    allNetworks.value = await getAllNetworkList();
    // Default to syscoin network
    selectedNetwork.value = 'syscoin';
    // Persist the selection
    await setSelectedNetwork('syscoin');
    // Update temporary fields
    await updateTempFields();
  }
}
</script>
