import { getProvider } from '@/utils/networkUtils';

export type BalanceCallback = (wei: bigint) => void;

// Holds the function to stop the current balance watcher, if there is any
let currentOff: (() => void) | null = null;

/**
 * Starts watching the balance of the specified `address`.
 * It invokes `onChange` with the updated balance every time a new block is mined.
 * It returns a function that, when called, stops the balance watcher.
 *
 * @param address - The Ethereum address whose balance is being watched.
 * @param onChange - The callback to invoke with the balance (in wei) on each update.
 * @param minDelay - The minimum delay (in milliseconds) between balance checks (default: 5000).
 * @returns A function that stops watching the balance when invoked.
 */
export async function watchBalance(
  address: string,
  onChange: BalanceCallback,
  minDelay = 5000
): Promise<() => void> {
  // It stops any existing balance watcher before starting a new one
  if (currentOff) currentOff();

  // It obtains a provider for the network and sets the polling interval
  const provider = await getProvider();
  provider.pollingInterval = minDelay;

  /**
   * It fetches the balance for the address and calls the onChange callback.
   * If the fetch fails, it logs a warning and retains the last known balance.
   */
  const refresh = async () => {
    try {
      const bal = await provider.getBalance(address);
      onChange(bal);
    } catch (err) {
      // It logs any error encountered during balance retrieval
      console.warn('Balance refresh failed', err);
    }
  };

  // It performs an initial fetch so the UI has an immediate value
  await refresh();

  // It sets up a listener to refresh the balance on every new block
  provider.on('block', refresh);

  // It returns a function that removes the block listener when called
  const off = () => provider.off('block', refresh);
  currentOff = off;
  return off;
}
