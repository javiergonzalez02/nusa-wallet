import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Login from "@/views/Login.vue";
import CreatePassword from "@/views/CreatePassword.vue";
import CreateSeedPhrase from "@/views/CreateSeedPhrase.vue";
import ConfirmSeedPhrase from "@/views/ConfirmSeedPhrase.vue";
import Settings from "@/views/Settings.vue";
import Tabs from "@/views/Tabs.vue";
import Dashboard from "@/views/Dashboard.vue";
import ImportSeed from "@/views/ImportSeed.vue";
import NetworkSettings from "@/views/NetworkSettings.vue";
import SecuritySettings from "@/views/SecuritySettings.vue";
import Send from "@/views/Send.vue";

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		redirect: '/login'
	},
	{
		path: '/login',
		name: 'login',
		component: Login
	},
	{
		path: '/createpass',
		name: 'createpass',
		component: CreatePassword,
		props: route => ({
			next: (route.query.next as string) || 'createseed'
		})
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
		path: '/importseed',
		name: 'importseed',
		component: ImportSeed
	},
	{
		path: '/tabs/',
		component: Tabs,
		children: [
			{
				path: '',
				redirect: '/tabs/dashboard'
			},
			{
				path: 'dashboard',
				name: 'dashboard',
				component: Dashboard
			},
			{
				path: 'send',
				name: 'send',
				component: Send
			},
			{
				path: 'settings',
				name: 'settings',
				component: Settings
			}
		]
	},
	{
		path: '/settings/network',
		name: 'NetworkSettings',
		component: NetworkSettings,
	}
	,
	{
		path: '/settings/security',
		name: 'SecuritySettings',
		component: SecuritySettings,
	}
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})

export default router
