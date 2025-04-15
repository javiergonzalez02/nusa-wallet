<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <!-- Define button with unique ID to trigger deletion alert -->
      <ion-button id="confirm-delete">
        Delete Seed Phrase
      </ion-button>
      <!-- Define button to retrieve Mnemonic Phrase -->
      <ion-button @click="getMnemonic">
        Get Seed
      </ion-button>
      <!-- Invoke logout handler on click -->
      <ion-button @click="logOut">
        Log out
      </ion-button>
      <!-- Configure alert triggered by the 'confirm-delete' button to confirm deletion -->
      <ion-alert
          trigger="confirm-delete"
          header="Confirm Delete"
          message="Are you sure you want to delete your seed phrase?"
          :buttons="alertButtons"
      ></ion-alert>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { IonAlert, IonButton, IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import { getSeedPhrase, removeSeedPhrase } from '@/utils/secureStorage/seed';
import { useRouter } from "vue-router";

const router = useRouter();

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
