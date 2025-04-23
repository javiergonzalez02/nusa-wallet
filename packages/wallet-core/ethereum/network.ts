import { ethers } from 'ethers';

export type EvmNetwork = 'syscoin' | 'syscoinTestnet' | 'ethereum' | 'polygon';

export const RPC_URLS: Record<EvmNetwork, string> = {
	syscoin: 'https://rpc.syscoin.org',                       // Syscoin NEVM Mainnet
	syscoinTestnet: 'https://rpc.tanenbaum.io',               // Syscoin NEVM Testnet
	ethereum: 'https://mainnet.infura.io/v3/YOUR_INFURA',     // Ethereum Mainnet
	polygon: 'https://polygon-rpc.com',                       // Polygon Mainnet
};

/**
 * Build a JsonRpcProvider for the given network.
 */
export function getProviderForNetwork(
		network: EvmNetwork
): ethers.JsonRpcProvider {
	const url = RPC_URLS[network];
	return new ethers.JsonRpcProvider(url);
}
