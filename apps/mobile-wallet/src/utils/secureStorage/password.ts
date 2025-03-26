import { StorageKey, setItem, getItem, removeItem } from './secureStorage';

/**
 * Stores wallet password in secure storage
 * @param password - Encryption password for the wallet
 * @throws {Error} When storage fails
 */
export const setPassword = (password: string) => 
  setItem(StorageKey.WalletPassword, password);

/**
 * Retrieves wallet password from secure storage
 * @returns Password string or null if not found
 */
export const getPassword = () => 
  getItem(StorageKey.WalletPassword);

/**
 * Removes wallet password from secure storage
 * @throws {Error} When removal fails
 */
export const removePassword = () => 
  removeItem(StorageKey.WalletPassword);