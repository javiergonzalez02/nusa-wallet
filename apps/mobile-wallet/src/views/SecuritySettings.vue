<template>
  <BaseLayout showBack title="Security Settings" defaultHref="/tabs/settings">
    <ion-content>
      <ion-list inset lines="none">
        <ion-item>
          <ion-label>
            <h2>Reveal Seed Phrase</h2>
            <p class="ion-text-wrap ion-text-small">
              Display your recovery phrase on‑screen. Make sure no one else can see your device.
            </p>
          </ion-label>
          <ion-button slot="end" expand="block" fill="solid" @click="getMnemonic">
            Reveal
          </ion-button>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Delete Seed Phrase</h2>
            <p class="ion-text-wrap ion-text-small">
              Permanently remove your seed from this device. You will be logged out—be sure you have a backup.
            </p>
          </ion-label>
          <ion-button slot="end" expand="block" fill="solid" color="danger" id="confirm-delete">
            Delete
          </ion-button>
        </ion-item>
      </ion-list>
      <!-- Configure alert triggered by the 'confirm-delete' button to confirm deletion -->
      <ion-alert
          trigger="confirm-delete"
          header="Confirm Delete"
          message="Are you absolutely sure you want to delete your seed phrase? This cannot be undone."
          :buttons="alertButtons"
      ></ion-alert>
    </ion-content>
  </BaseLayout>
</template>

<script lang="ts" setup>
import { IonAlert, IonButton, IonContent, IonItem, IonList } from '@ionic/vue';
import { getSeedPhrase, removeSeedPhrase } from '@/utils/secureStorage/seed';
import BaseLayout from '@/layouts/BaseLayout.vue';
import router from "@/router";

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
      await router.push({ name: 'login' }); // Navigate to login page
    },
  },
];

// Define getMnemonic function to retrieve the Mnemonic phrase
const getMnemonic = async() => {
  const seed = await getSeedPhrase();
  alert(seed);
};
</script>
