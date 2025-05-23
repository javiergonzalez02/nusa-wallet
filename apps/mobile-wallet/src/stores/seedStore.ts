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
    }
  }
});
