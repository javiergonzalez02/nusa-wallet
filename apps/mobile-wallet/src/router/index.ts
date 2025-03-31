import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import WelcomePage from "@/views/WelcomePage.vue";
import CreatePassword from "@/views/CreatePassword.vue";
import CreateSeedPhrase from "@/views/CreateSeedPhrase.vue";
import ConfirmSeedPhrase from "@/views/ConfirmSeedPhrase.vue";
import Settings from "@/views/Settings.vue";
import Tabs from "@/views/Tabs.vue";
import Dashboard from "@/views/Dashboard.vue";

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
    path: '/tabs',
    component: Tabs,
    children: [
      {
        path: '',
        redirect: 'dashboard'
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: Dashboard
      },
      {
        path: 'settings',
        name: 'settings',
        component: Settings
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
