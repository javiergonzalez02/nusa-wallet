import { defineStore } from 'pinia';

export const useAccountStore = defineStore('accountStore', {
  state: () => ({
    account: '' as string,
  }),
  actions: {
    /**
     * Sets the account to a provided value.
     *
     * @param account The current account to store.
     */
    setAccount(account: string) {
      this.account = account;
    }
  }
});
