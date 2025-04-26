import { Ref } from 'vue';
import { onIonViewDidLeave } from '@ionic/vue';

/**
 * Whenever the current Ionic view is left, reset each ref to its default.
 *
 * @param fields an array of tuples [ref, defaultValue]
 */
export function useResetOnLeave(...fields: Array<[ref: Ref<any>, defaultValue: any]>) {
	onIonViewDidLeave(() => {
		for (const [r, def] of fields) {
			r.value = def;
		}
	});
}
