import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * SecureStorage Service
 * Menggunakan Expo SecureStore untuk data sensitif:
 * - Session token
 * - Auth credentials / identifiers
 * - User role & active user credentials
 * 
 * Melindungi dari penyimpanan plain-text di AsyncStorage.
 * Memiliki fallback aman untuk browser/web environment.
 */

// In-memory fallback for Web platform where native SecureStore is not supported
const webMemoryStore: Record<string, string> = {};

export const secureStorage = {
  /**
   * Menyimpan string secara terenkripsi di SecureStore
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        webMemoryStore[key] = value;
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.setItem(`@secure_${key}`, value);
          }
        } catch {
          // ignore
        }
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn(`[SecureStore] Gagal menyimpan key: ${key}`, error);
      throw error;
    }
  },

  /**
   * Mengambil data terenkripsi dari SecureStore
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (webMemoryStore[key]) return webMemoryStore[key];
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            return window.sessionStorage.getItem(`@secure_${key}`);
          }
        } catch {
          // ignore
        }
        return null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`[SecureStore] Gagal membaca key: ${key}`, error);
      return null;
    }
  },

  /**
   * Menghapus item dari SecureStore
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        delete webMemoryStore[key];
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.removeItem(`@secure_${key}`);
          }
        } catch {
          // ignore
        }
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn(`[SecureStore] Gagal menghapus key: ${key}`, error);
    }
  },

  /**
   * Menyimpan JSON object sensitif
   */
  async setObject<T>(key: string, value: T): Promise<void> {
    const json = JSON.stringify(value);
    await this.setItem(key, json);
  },

  /**
   * Mengambil JSON object sensitif
   */
  async getObject<T>(key: string): Promise<T | null> {
    const val = await this.getItem(key);
    if (!val) return null;
    try {
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  },
};
