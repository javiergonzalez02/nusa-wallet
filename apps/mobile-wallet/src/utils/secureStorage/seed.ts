import { StorageKey, setItem, getItem, removeItem } from './secureStorage';

/**
 * Stores mnemonic seed phrase in secure storage
 * @param seed - BIP-39 compliant seed phrase
 * @throws {Error} When storage fails
 */
export const setSeedPhrase = (seed: string) => 
  setItem(StorageKey.Mnemonic, seed);

/**
 * Retrieves mnemonic seed phrase from secure storage
 * @returns Seed phrase or null if not found
 */
export const getSeedPhrase = () => 
  getItem(StorageKey.Mnemonic);

/**
 * Removes mnemonic seed phrase from secure storage
 * @throws {Error} When removal fails
 */
export const removeSeedPhrase = () => 
  removeItem(StorageKey.Mnemonic);