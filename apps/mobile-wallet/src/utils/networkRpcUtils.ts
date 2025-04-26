import { Storage } from '@ionic/storage';
import type { EvmNetwork } from '../../../../packages/wallet-core/ethereum/network';

const KEY = 'custom-rpc-urls';
const storage = new Storage();

async function ready() {
	await storage.create();
}

/**
 * Load any user-saved custom RPC URLs from storage.
 * Returns an object mapping networks to their custom URLs.
 * If nothing was saved, returns an empty object.
 */
export async function getCustomRpcUrls(): Promise<Partial<Record<EvmNetwork, string>>> {
	// Ensure the Ionic Storage instance is ready
	await ready();

	// Attempt to read the stored value (could be an object or null)
	// Assert its type so TypeScript knows it’s either a partial map or null
	const data = (await storage.get(KEY)) as Partial<Record<EvmNetwork, string>> | null;

	// If storage returned null (nothing saved), give back {} instead of null
	return data ?? {};
}

/**
 * Save a custom RPC URL for a specific network,
 * or remove it if the provided URL is blank.
 *
 * @param network - The EVM network (e.g., 'syscoin' or 'ethereum')
 * @param url     - The RPC URL to save; if empty or whitespace-only, the override is removed
 */
export async function setCustomRpcUrl(network: EvmNetwork, url: string): Promise<void> {
	// Make sure the Storage instance is initialized
	await ready();

	// Load any existing custom RPC URLs (returns {} if none)
	const current = await getCustomRpcUrls();

	if (url && url.trim() !== '') {
		// If the URL is non-blank after trimming, set it for this network
		current[network] = url.trim();
	}

	// Save the updated map of custom RPC URLs back to storage
	await storage.set(KEY, current);
}

