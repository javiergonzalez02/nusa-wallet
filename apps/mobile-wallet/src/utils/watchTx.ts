import { ethers } from 'ethers';
import { updateStatus, useTxHistory } from './txHistory';
import { getProvider } from '../stores/network';

// Ensure there is a provider bound to the current network
let provider: ethers.JsonRpcProvider;

/**
 * Re‑create watchers for all transactions that are still “pending”.
 * TODO Should be called on:
 *   • App launch / reload
 *   • Network change
 */
export async function resumeTxWatchers() {
	provider = getProvider();
	const pending = useTxHistory().value.filter(t => t.status === 'pending');
	for (const tx of pending) trackTx(tx.hash);
}

/**
 * Tracks a transaction until it settles and updates the history store.
 *
 * @param hash – Transaction hash to monitor until it’s confirmed or fails.
 */
export function trackTx(hash: string) {
	// Listens to new blocks; resolves when the tx has 1 confirmation
	// Works only while the App View remains active.
	provider.waitForTransaction(hash, 1)  // resolve after 1 confirmation
			.then(() => updateStatus(hash, 'confirmed'))
			.catch(() => updateStatus(hash, 'failed'));

	// Check Receipt:
	// - If receipt === null  -> still pending, try again later
	// - If receipt found     -> update status & stop polling
	const checkReceipt = async() => {
		try {
			const receipt = await provider.getTransactionReceipt(hash);
			if (!receipt) return;                       // still pending
			await updateStatus(hash, receipt.status === 1 ? 'confirmed' : 'failed');

			// Done: no more need to listen for visibility changes
			window.removeEventListener('visibilitychange', checkReceipt);
		} catch {
			// Network error; ignores and retries on next visibility
		}
	};

	// Runs `checkReceipt` whenever the app returns to foreground
	const onVisible = () => {
		if (document.visibilityState === 'visible') checkReceipt();
	};

	checkReceipt();                                           // immediate catch-up
  window.addEventListener('visibilitychange', onVisible);   // background safety-net
}
