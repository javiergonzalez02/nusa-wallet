import { Storage } from '@ionic/storage';
import { ethers } from 'ethers';
import type { NetworkKey, NetworkInfo } from '../../../../packages/wallet-core/ethereum/network';
import { getProviderForNetwork, getNetworkInfo } from '../../../../packages/wallet-core/ethereum/network';
import { getCustomNetworkOverrides } from './networkRpcUtils';

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

	// Retrieve base network configuration from predefined values
	const baseInfo = getNetworkInfo(key);

	// Load any existing user customizations for networks
	const overrides = await getCustomNetworkOverrides();

	// Extract overrides specific to current network, default to empty object if none exist
	const networkOverrides = overrides[key] || {};

	// Merge configurations with priority handling for critical fields
	return {
		// Spread base properties first (default values)
		...baseInfo,

		// Spread overrides second (user customizations will overwrite defaults)
		...networkOverrides,

		// Special handling for critical properties:
		// - Use || for rpcUrl to ensure non-empty string (reject empty override values)
		rpcUrl: networkOverrides.rpcUrl || baseInfo.rpcUrl,

		// - Use ?? for these fields to accept falsy-but-valid values (0, false, '')
		// while falling back to defaults only for null/undefined overrides
		chainId: networkOverrides.chainId ?? baseInfo.chainId,
		nativeSymbol: networkOverrides.nativeSymbol ?? baseInfo.nativeSymbol,
		label: networkOverrides.label ?? baseInfo.label,
		blockExplorer: networkOverrides.blockExplorer ?? baseInfo.blockExplorer,
	};
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
	const overrides: Partial<Record<NetworkKey, Partial<NetworkInfo>>> = await getCustomNetworkOverrides();
	// Get the custom RPC URL for the selected network, if one exists.
	const customRpc: string | undefined = overrides[net]?.rpcUrl;
	// Create and return a provider, using the custom RPC if available, otherwise the default.
	return getProviderForNetwork(net, customRpc);
}
