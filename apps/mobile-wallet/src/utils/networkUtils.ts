import { Storage } from '@ionic/storage';
import { ethers } from 'ethers';
import type { NetworkKey } from '../../../../packages/wallet-core/ethereum/network';
import { getProviderForNetwork } from '../../../../packages/wallet-core/ethereum/network';
import { getCustomRpcUrls } from './networkRpcUtils';

const KEY = 'evm-network';
const storage = new Storage();

async function ready() {
	await storage.create();
}

/**
 * Read or default to 'syscoin'.
 */
export async function getSelectedNetwork(): Promise<NetworkKey> {
	await ready();
	const n = (await storage.get(KEY)) as NetworkKey | null;
	return n ?? 'syscoin';
}

/**
 * Persist the user’s pick.
 */
export async function setSelectedNetwork(net: NetworkKey): Promise<void> {
	await ready();
	await storage.set(KEY, net);
}

/**
 * Build a provider for the *stored* network.
 */
export async function getProvider(): Promise<ethers.JsonRpcProvider> {
	const net = await getSelectedNetwork();
	const overrides = await getCustomRpcUrls();
  const customRpc = overrides[net];
	return getProviderForNetwork(net, customRpc);
}
