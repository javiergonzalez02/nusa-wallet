<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard" href="/tabs/dashboard">
          <ion-icon :icon="speedometerOutline"/>
          <ion-label>Dashboard</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="settings" href="/tabs/settings">
          <ion-icon :icon="settingsOutline"/>
          <ion-label>Settings</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonRouterOutlet,
  IonLabel,
  IonIcon
} from '@ionic/vue';
import { speedometerOutline, settingsOutline } from 'ionicons/icons';
import { onMounted, onUnmounted } from 'vue';

// Defines a function that prevents backward navigation by pushing the current state into the browser history.
const preventBack = () => {
  // Pushes a new history state with a null state object, an empty title, and the current URL.
  window.history.pushState(null, '', window.location.href);
};

// Upon mounting the component, executes preventBack to insert the current state into the history
// and adds a 'popstate' event listener to invoke preventBack when a backward navigation is attempted.
onMounted(() => {
  preventBack();
  window.addEventListener('popstate', preventBack);
});

// Upon unmounting the component, removes the 'popstate' event listener to prevent further invocations of preventBack.
onUnmounted(() => {
  window.removeEventListener('popstate', preventBack);
});

</script>
