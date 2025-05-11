import { Storage } from '@ionic/storage';
import { NETWORK_LIST, NetworkInfo } from '../../../../packages/wallet-core/ethereum/network';

const CUSTOM_NETWORKS_KEY = 'custom-networks';
const storage = new Storage();

async function ready() {
	await storage.create();
}

/**
 * Retrieve custom networks from storage.
 */
export async function getCustomNetworks(): Promise<NetworkInfo[]> {
	await ready();
	return (await storage.get(CUSTOM_NETWORKS_KEY)) || [];
}

/**
 * Add a new custom network to storage after validation.
 * @param {NetworkInfo} network - The custom network to add.
 */
export async function addCustomNetwork(network: NetworkInfo): Promise<void> {
	await ready();
	const customNetworks = await getCustomNetworks();
	const predefinedChainIds = NETWORK_LIST.map(n => n.chainId);

	// Prevent adding a network with a chain ID that matches a predefined network
	if (predefinedChainIds.includes(network.chainId)) {
		throw new Error(`A predefined network with chain ID ${network.chainId} already exists. Use overrides instead.`);
	}

	// Prevent duplicate chain IDs among custom networks
	if (customNetworks.some(n => n.chainId === network.chainId)) {
		throw new Error(`A custom network with chain ID ${network.chainId} already exists.`);
	}

	customNetworks.push(network);
	await storage.set(CUSTOM_NETWORKS_KEY, customNetworks);
}

/**
 * Update an existing custom network.
 * @param {string} key - The key (chainId as string) of the network to update.
 * @param {NetworkInfo} updatedNetwork - The updated network info.
 */
export async function updateCustomNetwork(key: string, updatedNetwork: NetworkInfo): Promise<void> {
	await ready();
	const customNetworks = await getCustomNetworks();
	const index = customNetworks.findIndex(n => n.key === key);
	if (index === -1) {
		throw new Error(`Custom network with key "${key}" not found.`);
	}

	// Validate chain ID doesn't conflict with predefined networks
	const predefinedChainIds = NETWORK_LIST.map(n => n.chainId);
	if (predefinedChainIds.includes(updatedNetwork.chainId) && updatedNetwork.chainId !== parseInt(key)) {
		throw new Error(`Chain ID ${updatedNetwork.chainId} conflicts with a predefined network.`);
	}

	customNetworks[index] = updatedNetwork;
	await storage.set(CUSTOM_NETWORKS_KEY, customNetworks);
}

/**
 * Delete a custom network from storage.
 * @param {string} key - The key (chainId as string) of the network to delete.
 */
export async function deleteCustomNetwork(key: string): Promise<void> {
	await ready();
	const customNetworks = await getCustomNetworks();
	const filtered = customNetworks.filter(n => n.key !== key);
	await storage.set(CUSTOM_NETWORKS_KEY, filtered);
}
