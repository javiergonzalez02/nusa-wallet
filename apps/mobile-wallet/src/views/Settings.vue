<template>
  <BaseLayout>
    <ion-content>
      <ion-list :inset="true" lines="none">
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
import { IonAlert, IonButton, IonContent, IonList, IonItem } from '@ionic/vue';
import { getSeedPhrase, removeSeedPhrase } from '@/utils/secureStorage/seed';
import { useRouter } from "vue-router";
import BaseLayout from "@/layouts/BaseLayout.vue";

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
