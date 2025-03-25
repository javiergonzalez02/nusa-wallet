import { ethers } from 'ethers';

// For testing purposes Syscoin NEVM Testnet will be set as default
const sysRpcUrl = 'https://rpc.tanenbaum.io';
const sysProvider = new ethers.JsonRpcProvider(sysRpcUrl);

/**
 * Derives the account's address and private key from a mnemonic,
 * creates a wallet instance, and fetches its balance.
 *
 * @param mnemonic - The mnemonic phrase used to generate the wallet.
 * @returns An object with the account address, private key, and balance (in ETH).
 */
export async function getAccountDetails(mnemonic: string): Promise<{
  address: string;
  privateKey: string;
  balance: string | null
}> {
  try {
    // Derive the first account's address and private key
    const hdNodeWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
    const address = hdNodeWallet.address;
    const privateKey = hdNodeWallet.privateKey;

    // Create a wallet instance with the provided provider
    const wallet = new ethers.Wallet(privateKey, sysProvider);

    // Fetch the balance (in wei) and format it to ETH
    const balanceBN = await wallet.provider.getBalance(address);
    const balance = ethers.formatEther(balanceBN);

    return { address, privateKey, balance };
  } catch (error) {
    console.error('Error fetching account details:', error);
    throw error;
  }
}
