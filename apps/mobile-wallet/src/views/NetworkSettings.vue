<template>
  <BaseLayout showBack title="Network Settings" defaultHref="/tabs/settings">
    <ion-content>
      <ion-list inset lines="none">
        <!-- Network selector -->
        <ion-item>
          <ion-select
              v-model="selectedNetwork"
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
        <ion-item>
          <ion-label position="stacked">Label</ion-label>
          <ion-input v-model.trim="workingCopy.label" :placeholder="base.label"/>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Chain ID</ion-label>
          <ion-input
              v-model.number="workingCopy.chainId"
              type="number"
              :placeholder="base.chainId.toString()"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Native Symbol</ion-label>
          <ion-input
              v-model.trim="workingCopy.nativeSymbol"
              :placeholder="base.nativeSymbol"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">RPC URL</ion-label>
          <ion-input
              v-model.trim="workingCopy.rpcUrl"
              type="url"
              :placeholder="base.rpcUrl"
          />
          <ion-note
              v-if="urlError"
              color="danger"
              class="ion-padding-start"
          >
            {{ urlError }}
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Block Explorer URL</ion-label>
          <ion-input
              v-model.trim="workingCopy.blockExplorer"
              :placeholder="base.blockExplorer"
          />
        </ion-item>

        <!-- Save and Delete Buttons -->
        <ion-item lines="none">
          <ion-button
              v-if="isCustom"
              color="danger"
              @click="removeCustomNetwork"
          >
            Delete Network
          </ion-button>

          <ion-button
              class="ion-margin-start"
              :disabled="!hasChanges"
              @click="saveChanges"
          >
            Save
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </BaseLayout>
</template>

<script setup lang="ts">
import {
  IonButton, IonContent, IonInput, IonItem, IonLabel, IonList,
  IonSelect, IonSelectOption, IonNote, modalController, toastController,
} from '@ionic/vue';
import { computed, reactive, watch } from 'vue';
import BaseLayout from '@/layouts/BaseLayout.vue';
import { useNetworkStore } from '@/stores/network';
import {
  NETWORKS,
  type NetworkInfo,
  type NetworkKey,
} from '../../../../packages/wallet-core/ethereum/network';
import CreateCustomNetwork from '@/components/CreateCustomNetwork.vue';

// Initialize network store
const net = useNetworkStore();

// Bind selected network key bidirectionally
const selectedNetwork = computed<string>({
  get: () => net.selected,
  set: k => net.select(k),
});

// Compute list of all networks
const allNetworks = computed(() => net.allNetworks);

// Determine if network is predefined
const isPredefined = computed(() => selectedNetwork.value in NETWORKS);

// Determine if network is custom
const isCustom = computed(() => !isPredefined.value);

// Derive base network info
const base = computed<NetworkInfo>(() =>
    isPredefined.value
        ? NETWORKS[selectedNetwork.value as NetworkKey]
        : net.selectedInfo,
);

// Create editable copy of selected network info
const workingCopy = reactive<NetworkInfo>({ ...net.selectedInfo });

// Reset workingCopy on network change
watch(selectedNetwork, () => {
  Object.assign(workingCopy, net.selectedInfo);
});

// RPC URL validation message
const urlError = computed(() =>
    isValidUrl(workingCopy.rpcUrl) ? '' : 'Invalid URL'
);

/**
 * Check whether a string is a valid URL
 * @param u  The URL string to validate
 * @returns  True if empty or valid URL; false otherwise
 */
function isValidUrl(u?: string): boolean {
  if (!u) return true;
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

/**
 * Compute differences between two NetworkInfo objects
 * @param a  Original info
 * @param b  Modified info
 * @returns  Object containing only changed keys and values
 */
function diff(a: NetworkInfo, b: NetworkInfo): Partial<NetworkInfo> {
  return Object.fromEntries(
      (Object.keys(a) as (keyof NetworkInfo)[])
          .filter(k => a[k] !== b[k])
          .map(k => [k, b[k]])
  ) as Partial<NetworkInfo>;
}

// Flag presence of unsaved changes
const hasChanges = computed(
    () => JSON.stringify(net.selectedInfo) !== JSON.stringify(workingCopy)
);

/**
 * Persist edits to the selected network
 * - If URL invalid: show error toast
 * - For predefined: apply override patch
 * - For custom: update stored entry
 */
async function saveChanges() {
  if (!hasChanges.value) return;
  if (urlError.value) return toast(urlError.value, 'danger');

  if (isPredefined.value) {
    const patch = diff(
        NETWORKS[selectedNetwork.value as NetworkKey],
        workingCopy
    );
    net.setOverride(selectedNetwork.value as NetworkKey, patch);
  } else {
    net.updateCustom(selectedNetwork.value, { ...workingCopy });
  }

  // Refresh form with saved values
  Object.assign(workingCopy, net.selectedInfo);
}

// Remove selected custom network
function removeCustomNetwork() {
  if (isCustom.value) {
    net.removeCustom(selectedNetwork.value);
  }
}

/**
 * Open "Add Custom Network" modal
 * When dismissed with data, add new network
 */
async function openAddNetworkModal() {
  const modal = await modalController.create({
    component: CreateCustomNetwork
  });
  modal.onDidDismiss().then(({ data }) => {
    if (data?.network) {
      net.addCustom(data.network);
    }
  });
  await modal.present();
}

/**
 * Show a brief toast notification
 * @param msg    Message text
 * @param color  Toast color theme
 */
async function toast(msg: string, color: string = 'primary') {
  const t = await toastController.create({
    message: msg,
    duration: 2000,
    color
  });
  await t.present();
}
</script>
