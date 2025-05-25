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
          <ion-button slot="end" expand="block" fill="solid" @click="promptPassword('reveal')">
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
          <ion-button slot="end" expand="block" fill="solid" color="danger" @click="promptPassword('delete')">
            Delete
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </BaseLayout>
</template>

<script lang="ts" setup>
import { alertController, IonButton, IonContent, IonItem, IonList } from '@ionic/vue';
import { getSeedPhrase, removeSeedPhrase } from '@/utils/secureStorage/seed';
import BaseLayout from '@/layouts/BaseLayout.vue';
import router from "@/router";
import { clearTxHistory } from "@/utils/txHistory";
import { getPassword } from "@/utils/secureStorage/password";

/**
 * Prompt the user for their wallet password before performing
 * either the "reveal" or "delete" action.
 */
async function promptPassword(action: 'reveal' | 'delete') {
  const pwAlert = await alertController.create({
    header: 'Enter Wallet Password',
    inputs: [{
      name: 'pw',
      type: 'password',
      placeholder: 'Password'
    }],
    buttons: [
      // Cancel button simply dismisses the prompt
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'OK',
        handler: async(data) => {
          // Retrieve stored password
          const stored = await getPassword();
          // If password is incorrect, show an error alert
          if (data.pw !== stored) {
            const err = await alertController.create({
              header: 'Error',
              message: 'Incorrect password',
              buttons: ['OK']
            });
            await err.present();
            return;
          }
          // Password is correct: decide which action to run
          if (action === 'reveal') {
            return showSeed();
          } else {
            return confirmDelete();
          }
        }
      }
    ]
  });
  await pwAlert.present();
}

/**
 * Show the user's seed phrase in an alert, with options to copy it.
 */
async function showSeed() {
  // Fetch the seed phrase (or empty string if none)
  const seed = await getSeedPhrase() ?? '';
  const seedAlert = await alertController.create({
    header: 'Your Recovery Phrase',
    message: seed,
    buttons: [
      {
        text: 'Copy',
        handler: () => navigator.clipboard.writeText(seed)
      },
      { text: 'Close', role: 'cancel' }
    ]
  });
  await seedAlert.present();
}

/**
 * Confirm with the user before deleting the seed phrase.
 */
async function confirmDelete() {
  const confirm = await alertController.create({
    header: 'Confirm Delete',
    message:
        'Are you absolutely sure you want to delete your seed phrase? This cannot be undone.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        handler: async() => {
          // Remove seed, clear history, and redirect to login
          await removeSeedPhrase();
          await clearTxHistory();
          await router.push({ name: 'login' });
        }
      }
    ]
  });
  await confirm.present();
}
</script>
