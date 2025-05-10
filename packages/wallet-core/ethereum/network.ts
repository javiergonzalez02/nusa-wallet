import { ethers } from 'ethers';

export const NETWORKS = {
  syscoin: {
    key: 'syscoin',
    label: 'Syscoin',
    chainId: 57,
    nativeSymbol: 'SYS',
    rpcUrls: ['https://rpc.syscoin.org'],
    blockExplorer: 'https://explorer.syscoin.org',
  },
  syscoinTestnet: {
    key: 'syscoinTestnet',
    label: 'Syscoin NEVM',
    chainId: 5700,
    nativeSymbol: 'tSYS',
    rpcUrls: ['https://rpc.tanenbaum.io'],
    blockExplorer: 'https://tanenbaum.io',
  },
  ethereum: {
    key: 'ethereum',
    label: 'Ethereum Mainnet',
    chainId: 1,
    nativeSymbol: 'ETH',
    rpcUrls: ['https://eth.llamarpc.com'],
    blockExplorer: 'https://etherscan.io',
  },
  ethereumSepolia: {
    key: 'ethereumSepolia',
    label: 'Ethereum Sepolia',
    chainId: 11155111,
    nativeSymbol: 'ETH',
    rpcUrls: ['https://eth-sepolia.public.blastapi.io'],
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  polygon: {
    key: 'polygon',
    label: 'Polygon',
    chainId: 137,
    nativeSymbol: 'POL',
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorer: 'https://polygonscan.com',
  },
} as const;

export const NETWORK_LIST: readonly NetworkInfo[] = Object.values(NETWORKS);

export type NetworkKey = keyof typeof NETWORKS;

export interface NetworkInfo {
  key: NetworkKey;
  label: string;
  chainId: number;
  nativeSymbol: string;
  rpcUrls: readonly string[];
  blockExplorer?: string;
}

/**
 * Fetch the full NetworkInfo object by key.
 */
export function getNetworkInfo(key: NetworkKey): NetworkInfo {
  return NETWORKS[key];
}

/**
 * Returns either the custom RPC (if provided & non‐empty), or falls back to default rpc.
 */
export function getRpcUrl(key: NetworkKey, customRpcUrl?: string): string {
	if (customRpcUrl && customRpcUrl.trim() !== '') {
		return customRpcUrl.trim();
	}
	return getNetworkInfo(key).rpcUrls[0];
}

/**
 * Build a JsonRpcProvider for the given network, optionally use a custom RPC URL.
 */
export function getProviderForNetwork(key: NetworkKey, customRpcUrl?: string): ethers.JsonRpcProvider {
	return new ethers.JsonRpcProvider(getRpcUrl(key, customRpcUrl));
}
