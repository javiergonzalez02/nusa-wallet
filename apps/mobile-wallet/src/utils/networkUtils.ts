import { Storage } from '@ionic/storage';
import { ethers } from 'ethers';
import type { EvmNetwork } from '../../../../packages/wallet-core/ethereum/network';
import { getProviderForNetwork } from '../../../../packages/wallet-core/ethereum/network';

const KEY = 'evm-network';
const storage = new Storage();

async function ready() {
	await storage.create();
}

/**
 * Read or default to 'syscoin'.
 */
export async function getSelectedNetwork(): Promise<EvmNetwork> {
	await ready();
	const n = (await storage.get(KEY)) as EvmNetwork | null;
	return n ?? 'syscoin';
}

/**
 * Persist the user’s pick.
 */
export async function setSelectedNetwork(net: EvmNetwork): Promise<void> {
	await ready();
	await storage.set(KEY, net);
}

/**
 * Build a provider for the *stored* network.
 */
export async function getProvider(): Promise<
		ethers.JsonRpcProvider
> {
	const net = await getSelectedNetwork();
	return getProviderForNetwork(net);
}
