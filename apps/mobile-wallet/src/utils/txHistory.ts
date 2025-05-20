import { ref, watch } from 'vue';
import { Storage } from '@ionic/storage';
import type { NetworkKey } from '../../../../packages/wallet-core/ethereum/network';
import { getSelectedNetwork } from "@/utils/networkUtils";

// Possible states a tracked transaction can have
export type TxStatus = 'pending' | 'confirmed' | 'failed';

// Structure for a stored transaction record
export interface TxRecord {
	hash: string;       // txid
	from: string;       // sender address
	to: string;         // recipient address
	amount: string;     // string-formatted ETH/SYS amount (e.g., "0.05")
	symbol: string;      // asset ticker, like "SYS" or "USDC"
	timestamp: number;  // submission time in ms (from Date.now())
	status: TxStatus;   // current status
}

const KEY = 'evm-tx-history'; // storage key
const storage = new Storage();

// One-time DB initializer (called before any read/write)
let storageReady: Promise<void> | null = null;

async function ready() {
	if (!storageReady) {
		storageReady = storage.create().then(() => void 0);
	}
	await storageReady;
}

/**
 * Save the current in-memory tx list (`list.value`) under the
 * bucket of the *currently* selected network.
 *
 * @returns Promise that resolves when the write to Ionic Storage completes.
 */
async function persist(): Promise<void> {
	await ready();                                   // make sure storage exists
	const net = await getSelectedNetwork();          // current network
	// Load the saved network‑to‑txlist map (or use an empty object if nothing’s stored),
	// and tell TypeScript it’s (possibly partial) Record<EvmNetwork, TxRecord[]>.
	const all = (await storage.get(KEY)) as Partial<Record<NetworkKey, TxRecord[]>> ?? {};
	all[net] = JSON.parse(JSON.stringify(list.value)); // deep-clone to strip refs
	await storage.set(KEY, all);                     // write back
}

// Active history list – auto-updates UI when modified
const list = ref<TxRecord[]>([]);
// Current active network (used to separate TXs by network)
let network: NetworkKey;

/**
 * Initializes the history system:
 * - Ensures the DB is ready.
 * - Loads transaction history for the current network into `list`.
 * Must be called before any other access.
 */
export async function initTxHistory() {
	await ready();
	network = await getSelectedNetwork();
	list.value = await storage.get(KEY).then((all) =>
			(all as Record<NetworkKey, TxRecord[]> ?? {})[network] ?? []
	);
}

/**
 * Watcher that syncs any changes in `list` to persistent storage.
 * Automatically triggered after any `.value` mutation.
 */
watch(list, async(newVal) => {
	await ready();
	const all = (await storage.get(KEY)) as Record<NetworkKey, TxRecord[]> ?? {};
	all[network] = newVal;
	await storage.set(KEY, all);
}, { deep: true });

/**
 * Returns the reactive list of transactions for use in components.
 * Will be empty until `initTxHistory()` is called.
 */
export function useTxHistory() {
	return list;
}

/**
 * Adds a new transaction record to the top of the history list.
 * Triggers immediate UI update and storage sync.
 *
 * @param tx - A new TxRecord (usually with status 'pending').
 */
export async function addTx(tx: TxRecord) {
	list.value.unshift(tx);
	await persist();
}

/**
 * Updates the status of a known transaction by hash.
 * Safely ignored if the tx isn't found in the list.
 *
 * @param hash - The transaction hash (txid).
 * @param s    - New status: 'pending', 'confirmed', or 'failed'.
 */
export async function updateStatus(hash: string, s: TxStatus) {
	const idx = list.value.findIndex(t => t.hash === hash);
	if (idx !== -1) {
		list.value[idx].status = s;
		await persist();
	}
}

/**
 * Delete tx history. Useful for when a seed phrase is deleted.
 */
export async function clearTxHistory() {
  await ready();
  await storage.remove(KEY);
	list.value = [];
}
