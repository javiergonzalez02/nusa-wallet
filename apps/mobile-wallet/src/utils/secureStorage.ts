import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

/**
 * Save the seed phrase to the device's secure storage.
 *
 * @param seed The mnemonic seed phrase.
 */
export async function setSeedPhrase(seed: string): Promise<void> {
  try {
    await SecureStoragePlugin.set({ key: 'mnemonic', value: seed });
  } catch (error) {
    console.error('Error saving seed phrase:', error);
    throw error;
  }
}

/**
 * Retrieve the seed phrase from secure storage.
 *
 * @returns The stored seed phrase or null if not found.
 */
export async function getSeedPhrase(): Promise<string | null> {
  try {
    const result = await SecureStoragePlugin.get({ key: 'mnemonic' });
    return result.value;
  } catch (error) {
    console.error('Error retrieving seed phrase:', error);
    return null;
  }
}

/**
 * Remove the seed phrase from secure storage.
 */
export async function removeSeedPhrase(): Promise<void> {
  try {
    await SecureStoragePlugin.remove({ key: 'mnemonic' });
  } catch (error) {
    console.error('Error removing seed phrase:', error);
    throw error;
  }
}
