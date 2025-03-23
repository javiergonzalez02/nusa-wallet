import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import WelcomePage from "@/views/WelcomePage.vue";
import CreatePassword from "@/views/CreatePassword.vue";
import CreateSeedPhrase from "@/views/CreateSeedPhrase.vue";
import ConfirmSeedPhrase from "@/views/ConfirmSeedPhrase.vue";
import MainView from "@/views/MainView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/welcome'
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: WelcomePage
  },
  {
    path: '/createpass',
    name: 'createpass',
    component: CreatePassword
  },
  {
    path: '/createseed',
    name: 'createseed',
    component: CreateSeedPhrase
  },
  {
    path: '/confirmseed',
    name: 'confirmseed',
    component: ConfirmSeedPhrase
  },
  {
    path: '/mainview',
    name: 'mainview',
    component: MainView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
