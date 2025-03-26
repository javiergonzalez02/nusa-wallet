import { ethers } from 'ethers';

// For testing purposes Syscoin NEVM Testnet will be set as default
const sysRpcUrl = 'https://rpc.tanenbaum.io';
const sysProvider = new ethers.JsonRpcProvider(sysRpcUrl);

/**
 * Derives the account's address from a mnemonic.
 * @param mnemonic - The mnemonic phrase used to generate the wallet.
 * @returns The account address.
 */
export function getAddressFromMnemonic(mnemonic: string): string {
  const hdNodeWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
  return hdNodeWallet.address;
}

/**
 * Derives the account's private key from a mnemonic.
 * @param mnemonic - The mnemonic phrase used to generate the wallet.
 * @returns The private key.
 */
export function getPrivateKeyFromMnemonic(mnemonic: string): string {
  const hdNodeWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
  return hdNodeWallet.privateKey;
}

/**
 * Fetches the balance (in ETH) of a given address.
 * @param address - The account address to fetch the balance for.
 * @returns The balance in ETH as a string.
 */
export async function getBalanceForAddress(address: string): Promise<string> {
  const balanceBN = await sysProvider.getBalance(address);
  return ethers.formatEther(balanceBN);
}

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
    const address = getAddressFromMnemonic(mnemonic);
    const privateKey = getPrivateKeyFromMnemonic(mnemonic);
    const balance = await getBalanceForAddress(address);

    return { address, privateKey, balance };
  } catch (error) {
    console.error('Error fetching account details:', error);
    throw error;
  }
}

/**
 * Sends an Ethereum transaction on the Syscoin NEVM Testnet.
 *
 * This function creates a wallet instance using the provided private key and the default testnet provider.
 * It constructs a transaction to send a specified amount (in ETH) to a recipient address,
 * sends the transaction, waits for it to be mined, and returns the transaction hash.
 *
 * @param privateKey - The private key of the sender's account.
 * @param toAddress - The recipient's Ethereum address.
 * @param amount - The amount of ETH to send (as a string).
 * @returns A Promise that resolves to the transaction hash (string) once the transaction is confirmed.
 */
export async function sendTransaction(
  privateKey: string,
  toAddress: string,
  amount: string
): Promise<string> {
  try {
    // Create a wallet instance using the provided private key and the system provider (Syscoin NEVM Testnet)
    const wallet = new ethers.Wallet(privateKey, sysProvider);

    // Build the transaction object:
    // - "to": the recipient's address
    // - "value": the amount to send, converted from ether to the blockchain's base unit (wei)
    const tx = {
      to: toAddress,
      value: ethers.parseEther(amount)
    };

    // Send the transaction using the wallet's sendTransaction method
    const txResponse = await wallet.sendTransaction(tx);

    // Wait for the transaction to be mined/confirmed on the blockchain
    await txResponse.wait();

    // Return the transaction hash as confirmation of successful submission
    return txResponse.hash;
  } catch (error) {
    // Log any errors encountered during the transaction process
    console.error('Error sending transaction:', error);
    // Re-throw the error so that calling code can handle it if needed
    throw error;
  }
}
