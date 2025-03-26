/**
 * Secure Storage Module
 *
 * Centralized utility for handling secure storage operations with type-safe keys.
 * Provides encrypted storage for sensitive data using platform-specific security APIs.
 */
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

/**
 * Enum defining all valid storage keys.
 * Acts as a single source of truth for storage key names.
 */
export enum StorageKey {
  /**
   * Key for storing wallet encryption password
   * @example StorageKey.WalletPassword -> 'walletPassword'
   */
  WalletPassword = 'walletPassword',

  /**
   * Key for storing mnemonic seed phrase
   * @example StorageKey.Mnemonic -> 'mnemonic'
   */
  Mnemonic = 'mnemonic',
}

/**
 * Safely stores a value in secure storage
 * @param key - Predefined key from StorageKey enum
 * @param value - Sensitive data to store
 * @throws {Error} When storage operation fails
 *
 * @example
 * await setItem(StorageKey.WalletPassword, 'myPassword123');
 */
export async function setItem(key: StorageKey, value: string): Promise<void> {
  try {
    await SecureStoragePlugin.set({ key, value });
  } catch (error) {
    console.error(`[SecureStorage] Failed to save ${key}:`, error);
    throw new Error(`SECURE_STORAGE_SAVE_ERROR: ${(error as Error).message}`);
  }
}

/**
 * Retrieves a value from secure storage
 * @param key - Predefined key from StorageKey enum
 * @returns Stored value or null if not found/error occurs
 *
 * @example
 * const password = await getItem(StorageKey.WalletPassword);
 */
export async function getItem(key: StorageKey): Promise<string | null> {
  try {
    const result = await SecureStoragePlugin.get({ key });
    return result.value;
  } catch (error) {
    console.error(`[SecureStorage] Failed to retrieve ${key}:`, error);
    return null;
  }
}

/**
 * Removes a value from secure storage
 * @param key - Predefined key from StorageKey enum
 * @throws {Error} When removal operation fails
 *
 * @example
 * await removeItem(StorageKey.Mnemonic);
 */
export async function removeItem(key: StorageKey): Promise<void> {
  try {
    await SecureStoragePlugin.remove({ key });
  } catch (error) {
    console.error(`[SecureStorage] Failed to remove ${key}:`, error);
    throw new Error(`SECURE_STORAGE_REMOVE_ERROR: ${(error as Error).message}`);
  }
}