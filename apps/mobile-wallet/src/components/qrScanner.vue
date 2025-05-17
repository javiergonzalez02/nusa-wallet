<template>
  <ion-button fill="clear" class="scanner-button" @click="onScan">
    <ion-icon :icon="scanOutline"/>
  </ion-button>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'
import { startScanning } from '@/utils/qrScanner'
import { IonButton, IonIcon } from "@ionic/vue";
import { scanOutline } from "ionicons/icons";

// Declare an emit function for the 'scanned' event with an optional string payload
const emit = defineEmits<{
  (event: 'scanned', value: string | undefined): void
}>()

// Define the scan handler to call startScanning and emit the result
const onScan = async() => {
  try {
    const value = await startScanning()
    emit('scanned', value)
  } catch (err) {
    console.error('Scanning error:', err)
  }
}
</script>
