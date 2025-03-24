import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

/**
 * Save the wallet password to secure storage.
 *
 * @param password The wallet password.
 */
export async function setPassword(password: string): Promise<void> {
  try {
    await SecureStoragePlugin.set({ key: 'walletPassword', value: password });
  } catch (error) {
    console.error('Error saving wallet password:', error);
    throw error;
  }
}

/**
 * Retrieve the wallet password from secure storage.
 *
 * @returns The stored password or null if not found.
 */
export async function getPassword(): Promise<string | null> {
  try {
    const result = await SecureStoragePlugin.get({ key: 'walletPassword' });
    return result.value;
  } catch (error) {
    console.error('Error retrieving wallet password:', error);
    return null;
  }
}

/**
 * Remove the wallet password from secure storage.
 */
export async function removePassword(): Promise<void> {
  try {
    await SecureStoragePlugin.remove({ key: 'walletPassword' });
  } catch (error) {
    console.error('Error removing wallet password:', error);
    throw error;
  }
}
