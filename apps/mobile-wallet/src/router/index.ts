import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import WelcomePage from "@/views/WelcomePage.vue";
import CreatePassword from "@/views/CreatePassword.vue";
import CreateSeedPhrase from "@/views/CreateSeedPhrase.vue";
import ConfirmSeedPhrase from "@/views/ConfirmSeedPhrase.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/welcome'
  },
  {
    path: '/welcome',
    component: WelcomePage
  },
  {
    path: '/createpass',
    component: CreatePassword
  },
  {
    path: '/createseed',
    component: CreateSeedPhrase
  },
  {
    path: '/confirmseed',
    component: ConfirmSeedPhrase
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
