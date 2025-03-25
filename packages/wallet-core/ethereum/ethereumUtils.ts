import { ethers } from 'ethers';

/**
 * Derives the first account address from a given mnemonic phrase.
 *
 * @param mnemonic - A string containing the mnemonic phrase used to generate the wallet.
 * @returns The Ethereum address associated with the first account derived from the mnemonic.
 */

export function getFirstAccountFromMnemonic(mnemonic: string): string {
  // Create an HDNodeWallet from the mnemonic
  const hdNodeWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
   return hdNodeWallet.address;
}
