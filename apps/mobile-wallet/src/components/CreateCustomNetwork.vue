<template>
  <ion-header>
    <ion-toolbar color="primary">
      <ion-title>Add Custom Network</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="dismiss()">Cancel</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-list>
      <ion-item>
        <ion-label position="stacked">Label</ion-label>
        <ion-input v-model="localNetwork.label" />
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Chain ID</ion-label>
        <ion-input v-model.number="localNetwork.chainId" type="number" />
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Native Symbol</ion-label>
        <ion-input v-model="localNetwork.nativeSymbol" />
      </ion-item>
      <ion-item>
        <ion-label position="stacked">RPC URL</ion-label>
        <ion-input v-model="localNetwork.rpcUrl" type="url" />
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Block Explorer URL</ion-label>
        <ion-input v-model="localNetwork.blockExplorer" />
      </ion-item>
      <ion-button expand="block" :disabled="!isValid" @click="addNetwork">
        Add Network
      </ion-button>
    </ion-list>
  </ion-content>
</template>

<script lang="ts" setup>
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  modalController,
} from '@ionic/vue';
import type { NetworkInfo } from '../../../../packages/wallet-core/ethereum/network';
import { computed, ref } from 'vue';

const localNetwork = ref<Partial<NetworkInfo>>({
  label: '',
  chainId: undefined,
  nativeSymbol: '',
  rpcUrl: '',
  blockExplorer: '',
});

const isValid = computed(() => {
  return (
    !!localNetwork.value.label &&
    !!localNetwork.value.chainId &&
    !!localNetwork.value.nativeSymbol &&
    !!localNetwork.value.rpcUrl &&
    isValidUrl(localNetwork.value.rpcUrl)
  );
});

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function dismiss() {
  modalController.dismiss();
}

async function addNetwork() {
  const network: NetworkInfo = {
    key: localNetwork.value.chainId!.toString(),
    label: localNetwork.value.label!,
    chainId: localNetwork.value.chainId!,
    nativeSymbol: localNetwork.value.nativeSymbol!,
    rpcUrl: localNetwork.value.rpcUrl!,
    blockExplorer: localNetwork.value.blockExplorer || undefined,
  };
  await modalController.dismiss({ network });
}
</script>
