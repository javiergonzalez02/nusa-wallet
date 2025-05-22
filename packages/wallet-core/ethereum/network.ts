import { ethers } from 'ethers';

export const NETWORKS = {
  syscoin: {
    key: 'syscoin',
    label: 'Syscoin NEVM',
    chainId: 57,
    nativeSymbol: 'SYS',
    rpcUrl: 'https://rpc.syscoin.org',
    blockExplorer: 'https://explorer.syscoin.org',
  },
  syscoinTestnet: {
    key: 'syscoinTestnet',
    label: 'Syscoin NEVM testnet',
    chainId: 5700,
    nativeSymbol: 'tSYS',
    rpcUrl: 'https://rpc.tanenbaum.io',
    blockExplorer: 'https://explorer.tanenbaum.io',
  },
  ethereum: {
    key: 'ethereum',
    label: 'Ethereum Mainnet',
    chainId: 1,
    nativeSymbol: 'ETH',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
  },
  ethereumSepolia: {
    key: 'ethereumSepolia',
    label: 'Ethereum Sepolia',
    chainId: 11155111,
    nativeSymbol: 'ETH',
    rpcUrl: 'https://eth-sepolia.public.blastapi.io',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  polygon: {
    key: 'polygon',
    label: 'Polygon',
    chainId: 137,
    nativeSymbol: 'POL',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
  },
} as const;

export type NetworkKey = keyof typeof NETWORKS;

export interface NetworkInfo {
  key: string;
  label: string;
  chainId: number;
  nativeSymbol: string;
  rpcUrl: string;
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
	return getNetworkInfo(key).rpcUrl;
}

/**
 * Build a JsonRpcProvider just by an RPC url passed by param.
 */
export function buildProvider(rpcUrl: string) {
  return new ethers.JsonRpcProvider(rpcUrl);
}
