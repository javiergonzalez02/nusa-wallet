import { ref } from 'vue';
import { ethers } from 'ethers';

/**
 * Creates a new Ethereum wallet mnemonic.
 *
 * Generates a random Ethereum wallet using ethers.js and retrieves its mnemonic phrase.
 *
 * @returns The mnemonic phrase from the generated wallet or a string explaining that the mnemonic is null.
 */
function createWalletMnemonic(): string {
  // Create a random Ethereum wallet.
  const wallet = ethers.Wallet.createRandom();

  // Check if the wallet's mnemonic is null.
  if (!wallet.mnemonic) {
    return 'Error: Generated wallet mnemonic is null. Please try again.';
  }

  // Return the mnemonic phrase.
  return wallet.mnemonic.phrase;
}

/**
 * Vue composable for managing Ethereum wallet mnemonic phrases.
 *
 * Provides a reactive `mnemonic` ref that holds the current mnemonic phrase and a function `generateNewMnemonic`
 * to update it with a new value.
 */
export function useMnemonic() {
  // Initialize the mnemonic ref with a generated wallet mnemonic.
  const mnemonic = ref(createWalletMnemonic());

  /**
   * Generates a new mnemonic and updates the reactive ref.
   */
  const generateNewMnemonic = () => {
    mnemonic.value = createWalletMnemonic();
  };

  // Return the reactive mnemonic and the function to update it.
  return { mnemonic, generateNewMnemonic };
}
