import { ethers } from 'ethers';

/**
 * Generates a random Ethereum wallet using ethers.js and retrieves its mnemonic phrase.
 *
 * @returns The mnemonic phrase from the generated wallet or a string explaining that the mnemonic is null.
 */
export function createWalletMnemonic(): string {
  // Create a random Ethereum wallet.
  const wallet = ethers.Wallet.createRandom();

  // Check if the wallet's mnemonic is null.
  if (!wallet.mnemonic) {
    return 'Error: Generated wallet mnemonic is null. Please try again.';
  }

  // Return the mnemonic phrase.
  return wallet.mnemonic.phrase;
}

export function getFirstAccountFromMnemonic(mnemonic: string): string {
  // Create an HDNodeWallet from the mnemonic
  const hdNodeWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
   return hdNodeWallet.address;
}
