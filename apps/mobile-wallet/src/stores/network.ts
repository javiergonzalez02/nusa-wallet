import { Storage } from '@ionic/storage';
import { defineStore } from 'pinia';
import { reactive, computed, watch, ref, toRaw } from 'vue';

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
		try {
			await storage.create();
			// Load the saved 'netconf' (custom + overrides)
			const raw = await storage.get('netconf');
			if (raw && typeof raw === 'object') Object.assign(state, raw);

			// Load the last‐selected network key (fallback to DEFAULT_STATE.selected)
			const last = await storage.get('selectedNetwork') as NetworkKey | null;
			state.selected = last ?? DEFAULT_STATE.selected;
			ready.value = true;

			// Persist state changes to storage after storage is ready
			watch(state, async() => {
				try {
					// Extract plain object from reactive state
					const plainState = toRaw(state);
					console.log('Attempting to save state:', JSON.stringify(plainState));
					// Ensure data is serializable
					JSON.stringify(plainState); // Throws if not serializable
					await storage.set('netconf', plainState);
					console.log('State saved via watcher');
				} catch (error: any) {
					console.error('Failed to save netconf via watcher:', error.message, error.stack);
				}
			}, { deep: true });
		} catch (error) {
			console.error('Failed to initialize storage:', error);
		}
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
		storage.set('selectedNetwork', k);
	}

	// Add a custom network
	function addCustom(n: NetworkInfo) {
		state.custom[n.key] = n;
	}

	// Update an existing custom network
	function updateCustom(k: string, p: Partial<NetworkInfo>) {
		Object.assign(state.custom[k], p);
	}

	// Remove a custom network and select default network
	function removeCustom(k: string) {
		delete state.custom[k];
		select(DEFAULT_STATE.selected);
	}

	// Set or clear an override for a network
	function setOverride(k: NetworkKey, patch: Partial<NetworkInfo>) {
		// Strip empty / null values
		const clean = Object.fromEntries(
				Object.entries(patch).filter(([, v]) => v !== '' && v != null)
		);
		// Merge or delete overrides
		if (Object.keys(clean).length === 0) delete state.overrides[k];
		else state.overrides[k] = { ...state.overrides[k], ...clean };
	}

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
