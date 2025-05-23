import { getProvider } from '@/stores/network';
import { fetchTokenBalance } from '../../../../packages/wallet-core/ethereum/ethereumUtils';
import type { ImportedToken } from '@/utils/tokenUtils';

export type TokenBalanceCallback = (wei: { [p: string]: string }) => void;

// Holds the function to stop the current balance watcher, if there is any
let currentTokenBalanceWatchOff: (() => void) | null = null;

/**
 * Starts watching the balance of the specified `address`.
 * It invokes `onChange` with the updated balance every time a new block is mined.
 * It returns a function that, when called, stops the balance watcher.
 *
 * @param address - The Ethereum address whose balance is being watched.
 * @param tokens - Array of ImportedToken { address, decimals, … }
 * @param onChange - The callback to invoke with the balance (in wei) on each update.
 * @param minDelay - The minimum delay (in milliseconds) between balance checks (default: 2000).
 * @returns A function that stops watching the balance when invoked.
 */
export async function watchTokenBalances(
		address: string,
		tokens: ImportedToken[],
		onChange: TokenBalanceCallback,
		minDelay = 2000
): Promise<() => void> {
	// It stops any existing balance watcher before starting a new one
	if (currentTokenBalanceWatchOff) currentTokenBalanceWatchOff();

	// It obtains a provider for the network and sets the polling interval
	const provider = getProvider();
	provider.pollingInterval = minDelay;

	/**
	 * It fetches the balance for the address and calls the onChange callback.
	 * If the fetch fails, it logs a warning and retains the last known balance.
	 */
	const refresh = async() => {
		const results: { [addr: string]: string } = {};
    await Promise.all(tokens.map(async t => {
      try {
        results[t.address] = await fetchTokenBalance(
          t.address,
          address,
          provider,
          t.decimals
        );
      } catch (e) {
        console.warn(`Failed to fetch ${t.symbol} balance`, e);
      }
    }));
    onChange(results);
	};

	// It performs an initial fetch so the UI has an immediate value
	await refresh();

	// It sets up a listener to refresh the balance on every new block
	provider.on('block', refresh);

	// It returns a function that removes the block listener when called
	const off = () => provider.off('block', refresh);
	currentTokenBalanceWatchOff = off;
	return off;
}
