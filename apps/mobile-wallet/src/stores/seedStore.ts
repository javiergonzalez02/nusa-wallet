import { defineStore } from 'pinia';
import { createWalletMnemonic } from '../../../../packages/wallet-core';

export const useSeedStore = defineStore('seedStore', {
  state: () => ({
    mnemonic: '' as string,
  }),
  actions: {
    /**
     * Generates and sets a new mnemonic.
     */
    generateMnemonic() {
      this.mnemonic = createWalletMnemonic();
    },
    /**
     * Sets the mnemonic to a provided value.
     *
     * @param newMnemonic The new mnemonic to store.
     */
    setMnemonic(newMnemonic: string) {
      this.mnemonic = newMnemonic;
    }
  }
});
