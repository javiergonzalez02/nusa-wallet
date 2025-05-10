import { Storage } from '@ionic/storage';
import { ethers } from 'ethers';
import type { NetworkKey, NetworkInfo } from '../../../../packages/wallet-core/ethereum/network';
import { getProviderForNetwork, getNetworkInfo } from '../../../../packages/wallet-core/ethereum/network';
import { getCustomRpcUrls } from './networkRpcUtils';

const KEY = 'evm-network';
const storage = new Storage();

async function ready() {
	await storage.create();
}

/**
 * Retrieve the key of the currently selected EVM network from persistent storage.
 * If no network has been previously selected and stored, it defaults to 'syscoin'.
 * @returns {Promise<NetworkKey>} A promise that resolves to the selected network's key (e.g., 'syscoin', 'ethereum').
 */
export async function getSelectedNetwork(): Promise<NetworkKey> {
	await ready(); // Ensure storage is initialized.
	// Attempt to get the stored network key. It might be null if never set.
	const n = (await storage.get(KEY)) as NetworkKey | null;
	return n ?? 'syscoin'; // Return the stored key, or 'syscoin' as the default.
}

/**
 * Fetch the detailed `NetworkInfo` object for the currently selected network.
 * This object contains comprehensive details like chain ID, native symbol, RPC URLs, etc.
 * @returns {Promise<NetworkInfo>} A promise that resolves to the `NetworkInfo` object.
 */
export async function getSelectedNetworkInfo(): Promise<NetworkInfo> {
	// Get the key of the currently selected network.
	const key: NetworkKey = await getSelectedNetwork();
	// Use that key to retrieve the full network information object.
	return getNetworkInfo(key);
}

/**
 * Persist the user's choice of network to Ionic Storage.
 * @param {NetworkKey} net - The key of the network to be saved as the selected one.
 * @returns {Promise<void>} A promise that resolves when the network selection has been saved.
 */
export async function setSelectedNetwork(net: NetworkKey): Promise<void> {
	await ready();
	await storage.set(KEY, net);
}

/**
 * Construct and return an ethers.js `JsonRpcProvider` for the currently selected network.
 * It considers any custom RPC URL the user might have configured for that network.
 * If no custom RPC is set, it uses the default RPC URL for the network.
 * @returns {Promise<ethers.JsonRpcProvider>} A promise that resolves to an ethers.js JsonRpcProvider instance.
 */
export async function getProvider(): Promise<ethers.JsonRpcProvider> {
	// Determine the currently selected network.
	const net: NetworkKey = await getSelectedNetwork();
	// Fetch any custom RPC URL overrides the user might have saved.
	const overrides: Partial<Record<NetworkKey, string>> = await getCustomRpcUrls();
	// Get the custom RPC URL for the selected network, if one exists.
	const customRpc: string | undefined = overrides[net];
	// Create and return a provider, using the custom RPC if available, otherwise the default.
	return getProviderForNetwork(net, customRpc);
}
