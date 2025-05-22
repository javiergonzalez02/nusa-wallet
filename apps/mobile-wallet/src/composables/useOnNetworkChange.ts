import { watch, onMounted, type WatchStopHandle } from 'vue';
import { useNetworkStore } from '@/utils/network';
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

	// 1) One-time watcher: wait until the store finishes initializing...
	const stopReady = watch(
			() => net.ready,               // watch the "ready" flag
			(isReady) => {
				if (isReady) {
					run();                     // run effect once store is ready
					stopReady();               // then immediately stop this watcher
				}
			},
			{ immediate: true },           // also invoke callback on registration
	);

	// 2) Ensure effect also runs once when the component is mounted
	onMounted(run);

	// 3) Main watcher: observe changes to the selected network key,
	//    and run effect each time the user switches networks.
	return watch(
			() => net.selected,            // watch the "selected" network key
			run,                           // invoke effect on every change
	);
}