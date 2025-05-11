import { Storage } from '@ionic/storage';
import type { NetworkKey, NetworkInfo } from '../../../../packages/wallet-core/ethereum/network';

const KEY = 'custom-network-overrides';
const storage = new Storage();

async function ready() {
	await storage.create();
}

/**
 * Retrieve user-configured network customizations from persistent storage.
 * Returns a map of network keys to their customized properties.
 * If no customizations exist, returns an empty object.
 */
export async function getCustomNetworkOverrides(): Promise<Partial<Record<NetworkKey, Partial<NetworkInfo>>>> {
	await ready();
	const data = (await storage.get(KEY)) as Partial<Record<NetworkKey, Partial<NetworkInfo>>> | null;
	return data ?? {};
}

/**
 * Save or update custom network configuration for a specific blockchain network.
 * Removes existing overrides if an empty configuration object is provided.
 *
 * @param network - The blockchain network identifier (e.g., 'syscoin', 'ethereum')
 * @param overrides - Network properties to override (RPC URL, chain ID, symbol, etc.)
 */
export async function setCustomNetworkOverride(network: NetworkKey, overrides: Partial<NetworkInfo>): Promise<void> {
	await ready();
	const current = await getCustomNetworkOverrides();
	if (Object.keys(overrides).length === 0) {
		// Clear overrides if empty configuration provided
		delete current[network];
	} else {
		// Merge new overrides with existing configuration
		current[network] = overrides;
	}
	await storage.set(KEY, current);
}
