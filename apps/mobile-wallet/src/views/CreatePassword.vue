<template>
  <BaseLayout>
    <h1>Create your Password!</h1>
    <!-- Password Input Field -->
    <ion-item>
      <ion-input
          v-model="password"
          type="password"
          label="Password"
          label-placement="stacked"
          placeholder="Enter password"
      ></ion-input>
    </ion-item>
    <!-- Repeat Password Input Field -->
    <ion-item>
      <ion-input
          v-model="repeatPassword"
          type="password"
          label="Repeat Password"
          label-placement="stacked"
          placeholder="Repeat password"
      ></ion-input>
    </ion-item>
    <!-- Enter Wallet Button -->
    <ion-button @click="enterWallet">
      Enter Wallet
    </ion-button>
    <!-- Error Message -->
    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
  </BaseLayout>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {IonButton, IonItem, IonInput} from '@ionic/vue';
import BaseLayout from '../layouts/BaseLayout.vue';
import {useRouter} from 'vue-router';
import {setPassword} from '@/utils/secureStorage/password';

const router = useRouter();
const password = ref('');
const repeatPassword = ref('');
const errorMessage = ref('');

const enterWallet = async () => {
  // Validate that both passwords match
  if (password.value !== repeatPassword.value) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }

  try {
    // Save the password securely
    await setPassword(password.value);
    await router.push({name: 'createseed'});
  } catch (error) {
    errorMessage.value = 'Error saving password.';
    console.error('Error:', error);
  }
};
</script>
