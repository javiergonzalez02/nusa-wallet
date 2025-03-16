import { ref } from 'vue';
import { ethers } from 'ethers';

export function useMnemonic() {
  // Create random wallet
  const wallet = ethers.Wallet.createRandom();
  // Store Mnemonic in a ref
  const mnemonic = ref(wallet.mnemonic.phrase);

  // Create a new Mnemonic
  const generateNewMnemonic = () => {
    const newWallet = ethers.Wallet.createRandom();
    mnemonic.value = newWallet.mnemonic.phrase;
  };

  return { mnemonic, generateNewMnemonic };
}
