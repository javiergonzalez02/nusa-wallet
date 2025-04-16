import { onMounted, onUnmounted } from 'vue';

export function usePreventBack() {
	// Defines a function that prevents backward navigation by pushing the current state into the browser history.
	const preventBack = () => {
		// Pushes a new history state with a null state object, an empty title, and the current URL.
		window.history.pushState(null, '', window.location.href);
	};

	// Upon mounting the component, executes preventBack to insert the current state into the history
	// and adds a 'popstate' event listener to invoke preventBack when a backward navigation is attempted.
	onMounted(() => {
		preventBack();
		window.addEventListener('popstate', preventBack);
	});

	// Upon unmounting the component, removes the 'popstate' event listener to prevent further invocations of preventBack.
	onUnmounted(() => {
		window.removeEventListener('popstate', preventBack);
	});
}