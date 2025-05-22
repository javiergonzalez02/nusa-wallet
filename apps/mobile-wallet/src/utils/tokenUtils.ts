import { Storage } from '@ionic/storage';
import type { NetworkKey } from '../../../../packages/wallet-core/ethereum/network';
import { getSelectedNetwork } from './network';

/**
 * A token imported by the user.
 */
export interface ImportedToken {
  /** Contract address of the token */
  address: string;
  /** Token ticker symbol, e.g. “USDC” */
  symbol: string;
  /** Human-readable name, e.g. “USD Coin” */
  name: string;
  /** Decimal precision (from the token contract) */
  decimals: number;
}

/** Key under which all tokens are stored */
const STORAGE_KEY = 'evm-imported-tokens';
const storage = new Storage();

/**
 * Ensure the Ionic Storage instance is ready before any operations.
 *
 * @returns Promise that resolves once storage is initialized.
 */
async function ready() {
  await storage.create();
}

/**
 * Retrieve the list of tokens the user has imported for the current network.
 *
 * @returns A Promise resolving to an array of ImportedToken objects.
 */
export async function getImportedTokens(): Promise<ImportedToken[]> {
  await ready();
  const net = getSelectedNetwork();
  const all = (await storage.get(STORAGE_KEY)) as Record<NetworkKey, ImportedToken[]> || {};
  return all[net] || [];
}

/**
 * Add a new token to the imported list for the current network, if not already present.
 *
 * @param token - The ImportedToken object to add.
 * @returns A Promise that resolves once the token has been saved.
 */
export async function addImportedToken(token: ImportedToken): Promise<void> {
  await ready();
  const net = await getSelectedNetwork();
  const all = (await storage.get(STORAGE_KEY)) as Record<NetworkKey, ImportedToken[]> || {};
  const existing = all[net] || [];

  // Only add if this address isn’t already in the list
  if (!existing.find(t => t.address.toLowerCase() === token.address.toLowerCase())) {
    all[net] = [...existing, token];
    await storage.set(STORAGE_KEY, all);
  }
}

/**
 * Remove a token (by contract address) from the imported list of the current network.
 *
 * @param address - The contract address of the token to remove.
 * @returns A Promise that resolves once the token has been removed.
 */
export async function removeImportedToken(address: string): Promise<void> {
  await ready();
  const net = getSelectedNetwork();
  const all = (await storage.get(STORAGE_KEY)) as Record<NetworkKey, ImportedToken[]> || {};
  all[net] = (all[net] || []).filter(t => t.address.toLowerCase() !== address.toLowerCase());
  await storage.set(STORAGE_KEY, all);
}
