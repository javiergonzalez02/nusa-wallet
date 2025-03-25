import { ethers } from 'ethers';

/**
 * Derives the first account's address and private key from a given mnemonic phrase.
 *
 * @param mnemonic - A string containing the mnemonic phrase used to generate the wallet.
 * @returns An object containing the Ethereum address and private key associated with the first account.
 */
export function getFirstAccountAndPrivateKeyFromMnemonic(mnemonic: string): { address: string; privateKey: string } {
  const hdNodeWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
  return {
    address: hdNodeWallet.address,
    privateKey: hdNodeWallet.privateKey,
  };
}
