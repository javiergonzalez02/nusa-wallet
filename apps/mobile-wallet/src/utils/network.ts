import { Storage } from '@ionic/storage';
import { defineStore } from 'pinia';
import { reactive, computed, watch, ref } from 'vue';
import {
	NETWORKS,
	buildProvider,
	type NetworkInfo,
	type NetworkKey
} from '../../../../packages/wallet-core/ethereum/network';
import { ethers } from "ethers";

// Define default store state
const DEFAULT_STATE = {
	selected: 'syscoin',
	custom: {} as Record<string, NetworkInfo>,
	overrides: {} as Record<string, Partial<NetworkInfo>>,
};

type State = typeof DEFAULT_STATE;

// Instantiate persistent storage
const storage = new Storage();

export const useNetworkStore = defineStore('networks', () => {
	// Create reactive state and readiness flag
	const state = reactive<State>({ ...DEFAULT_STATE });
	const ready = ref(false);
	// Initialize storage and load saved configuration
	(async() => {
		await storage.create();
		const raw = await storage.get('netconf');
		if (raw && typeof raw === 'object') Object.assign(state, raw);
		ready.value = true;
	})();

	// Reference built-in network definitions
	const predefined = NETWORKS as Record<NetworkKey, NetworkInfo>;

	// Compute full list of networks (predefined + custom)
	const allNetworks = computed(() => [
		...Object.values(predefined),
		...Object.values(state.custom),
	]);

	// Expose selected key with getter/setter
	const selected = computed({
		get: () => state.selected,
		set: k => {
			state.selected = k;
		},
	});

	// Compute full network info for the selected key
	const selectedInfo = computed<NetworkInfo>(() => {
		const base = predefined[selected.value as NetworkKey] ?? state.custom[selected.value];
		if (!base) throw new Error(`Unknown key ${selected.value}`);
		return { ...base, ...state.overrides[selected.value] };
	});

	// Build RPC provider for the selected network
	const provider = computed(() => buildProvider(selectedInfo.value.rpcUrl));

	// Select a network by key
	function select(k: string) {
		selected.value = k;
	}

	// Add a custom network
	function addCustom(n: NetworkInfo) {
		state.custom[n.key] = n;
	}

	// Update an existing custom network
	function updateCustom(k: string, p: Partial<NetworkInfo>) {
		Object.assign(state.custom[k], p);
	}

	// Remove a custom network
	function removeCustom(k: string) {
		delete state.custom[k];
	}

	// Set or clear an override for a network
	function setOverride(k: NetworkKey, p: Partial<NetworkInfo>) {
		if (Object.keys(p).length === 0) delete state.overrides[k];
		else state.overrides[k] = { ...state.overrides[k], ...p };
	}

	// Persist state changes to storage
	watch(state, v => storage.set('netconf', v), { deep: true });

	return {
		selected,
		allNetworks,
		selectedInfo,
		provider,
		ready,
		select, addCustom, updateCustom, removeCustom, setOverride,
	};
});

// Return selected network key
export function getSelectedNetwork(): NetworkKey {
	return useNetworkStore().selected as NetworkKey;
}

// Return JSON-RPC provider for selected network
export function getProvider(): ethers.JsonRpcProvider {
	return useNetworkStore().provider;
}
