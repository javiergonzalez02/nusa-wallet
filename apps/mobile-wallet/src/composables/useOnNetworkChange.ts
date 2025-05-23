import { watch, onMounted, type WatchStopHandle } from 'vue';
import { useNetworkStore } from '@/stores/network';
import type { NetworkInfo } from '../../../../packages/wallet-core/ethereum/network';
import type { ethers } from 'ethers';

/**
 * Register a callback to run whenever the JSON-RPC provider or selected network changes.
 * @param effect - A function that receives the current provider and network info
 * @returns A stop-handle that can be called to stop watching network-key changes
 */
export function useOnNetworkChange(
		effect: (
				provider: ethers.JsonRpcProvider,
				info: NetworkInfo,
		) => void | Promise<void>,
): WatchStopHandle {
	// Grab the reactive network store
	const net = useNetworkStore();

	// Create a helper that always invokes the callback with the store’s current provider and network info
	const run = () => effect(net.provider, net.selectedInfo);

	// 1) One-time watcher: immediately call the callback with the current `net.ready` value (to catch an already-ready store),
  //    then automatically unsubscribe as soon as `net.ready` becomes true
	const stopReady = watch(
			() => net.ready,            // watch the store’s `ready` boolean
			(isReady) => {  // isReady: the current value of `net.ready`
				if (isReady) {
					stopReady();                   // cleanup this watcher once the store is ready
				}
			},
			{ immediate: true },       // trigger callback right away to handle an already-ready state
	);

	// 2) Main watcher: observe changes to the NetworkInfo object,
	// and run effect each time the user switches networks or modifies any network details
	return watch(
			() => net.selectedInfo,     // watch the entire selectedInfo object
			run,                           // invoke effect on every change
			{ deep: true }
	);
}