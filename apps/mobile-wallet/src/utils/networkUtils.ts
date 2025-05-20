import { Storage } from '@ionic/storage';
import { ethers } from 'ethers';
import type { NetworkKey, NetworkInfo } from '../../../../packages/wallet-core/ethereum/network';
import { getProviderForNetwork, NETWORK_LIST } from '../../../../packages/wallet-core/ethereum/network';
import { getCustomNetworkOverrides } from './customNetworkOverride';
import { getCustomNetworks } from './customNetwork'

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
 * Retrieve the complete network configuration for the currently selected blockchain,
 * combining predefined network settings with any user-customized values. Ensures critical
 * network properties always contain valid values even when overrides are incomplete or invalid.
 *
 * @returns {Promise<NetworkInfo>} Promise resolving to merged network configuration containing:
 * - Chain ID, RPC URL, symbol, label, and block explorer
 * - User customizations where provided and valid
 * - Default values where customizations are missing or invalid
 */
export async function getSelectedNetworkInfo(): Promise<NetworkInfo> {
	// Get stored network selection from persistent storage
	const key: NetworkKey = await getSelectedNetwork();
	const predefined = NETWORK_LIST.find(n => n.key === key);

	if (predefined) {
		// Predefined network with potential overrides
		const overrides = await getCustomNetworkOverrides();
		const networkOverrides = overrides[key] || {};
		return {
			...predefined,
			...networkOverrides,
			rpcUrl: networkOverrides.rpcUrl || predefined.rpcUrl,
			chainId: networkOverrides.chainId ?? predefined.chainId,
			nativeSymbol: networkOverrides.nativeSymbol ?? predefined.nativeSymbol,
			label: networkOverrides.label ?? predefined.label,
			blockExplorer: networkOverrides.blockExplorer ?? predefined.blockExplorer,
		};
	} else {
		// Custom network
		const customNetworks = await getCustomNetworks();
		const customNetwork = customNetworks.find(n => n.key === key);
		if (customNetwork) {
			return customNetwork;
		}
		throw new Error(`Network with key "${key}" not found.`);
	}
}

/**
 * Persist the user's choice of network to Ionic Storage.
 * @param {NetworkKey} net - The key of the network to be saved as the selected one.
 * @returns {Promise<void>} A promise that resolves when the network selection has been saved.
 */
export async function setSelectedNetwork(net: string): Promise<void> {
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
	const overrides: Partial<Record<NetworkKey, Partial<NetworkInfo>>> = await getCustomNetworkOverrides();
	// Get the custom RPC URL for the selected network, if one exists.
	const customRpc: string | undefined = overrides[net]?.rpcUrl;
	// Create and return a provider, using the custom RPC if available, otherwise the default.
	return getProviderForNetwork(net, customRpc);
}

/**
 * Retrieve a list of all available networks (predefined + custom).
 */
export async function getAllNetworkList(): Promise<NetworkInfo[]> {
	const predefined = NETWORK_LIST;
	const custom = await getCustomNetworks();
	return [...predefined, ...custom];
}
