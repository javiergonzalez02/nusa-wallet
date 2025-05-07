import { ethers } from 'ethers';

/**
 * Minimal ERC-20 interface for reading token data:
 *  - name():       token name
 *  - symbol():     token symbol
 *  - decimals():   decimal precision
 *  - balanceOf():  balance of a given address
 *
 * Needed to encode/decode calls between ethers.js and any ERC-20 contract.
 */
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)'
];

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
 * @param provider - The provider of the chosen network.
 * @returns The balance in ETH as a string.
 */
export async function getBalanceForAddress(address: string, provider: ethers.JsonRpcProvider): Promise<string> {
	try {
		const balanceBN = await provider.getBalance(address);
		return ethers.formatEther(balanceBN);
	} catch (error) {
		return 'Error fetching balance';
	}
}

/**
 * Derives the account's address and private key from a mnemonic,
 * creates a wallet instance, and fetches its balance via the supplied provider.
 *
 * @param mnemonic - The mnemonic phrase used to generate the wallet.
 * @param provider - The provider of the chosen network.
 * @returns An object with the account address, private key, and balance (in ETH).
 */
export async function getAccountDetails(mnemonic: string, provider: ethers.JsonRpcProvider): Promise<{
	address: string;
	privateKey: string;
	balance: string | null
}> {
	try {
		const address = getAddressFromMnemonic(mnemonic);
		const privateKey = getPrivateKeyFromMnemonic(mnemonic);
		const balance = await getBalanceForAddress(address, provider);

		return { address, privateKey, balance };
	} catch (error) {
		console.error('Error fetching account details:', error);
		throw error;
	}
}

/**
 * Sends an Ethereum transaction on any EVM network.
 *
 * This function creates a wallet instance using the provided private key and the network provider.
 * It constructs a transaction to send a specified amount (in ETH) to a recipient address and
 * sends it. It does not wait for confirmation, the caller is responsible to track the result.
 *
 * @param privateKey - The private key of the sender's account.
 * @param toAddress - The recipient's Ethereum address.
 * @param amount - The amount of ETH to send (as a string).
 * @param provider - The provider of the chosen network.
 * @returns The `ethers.TransactionResponse` produced by`wallet.sendTransaction()`.
 *          –`response.hash`  -> TX hash to monitor
 *          –`response.wait`  -> call if you *do* want to await mining
 *
 * @throws  Re‑throws any error from `ethers` (e.g. insufficient
 *          gas, invalid nonce, user-provided bad params).
 */
export async function sendTransaction(
		privateKey: string,
		toAddress: string,
		amount: string,
		provider: ethers.JsonRpcProvider
): Promise<ethers.TransactionResponse> {
	try {
		// Create a wallet instance using the provided private key and the network provider
		const wallet = new ethers.Wallet(privateKey, provider);

		// Build the transaction object:
		// - "to": the recipient's address
		// - "value": the amount to send, converted from ether to the blockchain's base unit (wei)
		const tx = {
			to: toAddress,
			value: ethers.parseEther(amount)
		};

		// Send the transaction using the wallet's sendTransaction method
		return wallet.sendTransaction(tx);
	} catch (error) {
		// Log any errors encountered during the transaction process
		console.error('Error sending transaction:', error);
		// Re-throw the error so that calling code can handle it if needed
		throw error;
	}
}

/**
 * Fetch basic metadata for an ERC-20 token.
 *
 * @param tokenAddress - The on-chain address of the ERC-20 token contract.
 * @param provider     - An ethers.js JSON-RPC provider connected to the target network.
 * @returns A Promise that resolves to an object containing:
 *  • name:     The token’s human-readable name.
 *  • symbol:   The token’s ticker symbol.
 *  • decimals: The number of decimal places the token uses.
 */
export async function fetchTokenMetadata(
  tokenAddress: string,
  provider: ethers.JsonRpcProvider
): Promise<{ name: string; symbol: string; decimals: number }> {
  const c = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const [name, symbol, decimals] = await Promise.all([
    c.name(),
    c.symbol(),
    c.decimals()
  ]);
  return { name, symbol, decimals };
}

/**
 * Fetch the token balance of a specific user address.
 *
 * @param tokenAddress - The on-chain address of the ERC-20 token contract.
 * @param userAddress  - The wallet address whose token balance you want to query.
 * @param provider     - An ethers.js JSON-RPC provider connected to the target network.
 * @param decimals     - The token’s decimal precision (from fetchTokenMetadata).
 * @returns A Promise that resolves to the user’s token balance as a formatted string,
 *          accounting for the token’s decimals (e.g. "1.2345").
 */
export async function fetchTokenBalance(
  tokenAddress: string,
  userAddress: string,
  provider: ethers.JsonRpcProvider,
  decimals: number
): Promise<string> {
  const c = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const bn = await c.balanceOf(userAddress);
  // Format with the correct decimals
  return ethers.formatUnits(bn, decimals);
}
