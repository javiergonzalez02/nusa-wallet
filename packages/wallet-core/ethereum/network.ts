import { ethers } from 'ethers';

export type EvmNetwork = 'syscoin' | 'syscoinTestnet' | 'ethereum' | 'polygon';

export const DEFAULT_RPC_URLS: Record<EvmNetwork, string> = {
	syscoin: 'https://rpc.syscoin.org',                       // Syscoin NEVM Mainnet
	syscoinTestnet: 'https://rpc.tanenbaum.io',               // Syscoin NEVM Testnet
	ethereum: 'https://eth.llamarpc.com',                     // Ethereum Mainnet
	polygon: 'https://polygon-rpc.com',                       // Polygon Mainnet
};

/**
 * Returns either the custom RPC (if provided & non‐empty),
 * or falls back to DEFAULT_RPC_URLS.
 */
export function getRpcUrl(network: EvmNetwork, customRpcUrl?: string): string {
	if (customRpcUrl && customRpcUrl.trim() !== '') {
		return customRpcUrl.trim();
	}
	return DEFAULT_RPC_URLS[network];
}

/**
 * Build a JsonRpcProvider for the given network.
 * optionally using a user-supplied RPC URL.
 */
export function getProviderForNetwork(network: EvmNetwork, customRpcUrl?: string): ethers.JsonRpcProvider {
	const url = getRpcUrl(network, customRpcUrl);
	return new ethers.JsonRpcProvider(url);
}
