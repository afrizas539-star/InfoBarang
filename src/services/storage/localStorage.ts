import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * LocalStorage Service
 * Menggunakan @react-native-async-storage/async-storage untuk data non-sensitif:
 * - Cache katalog barang
 * - Preferensi aplikasi (tema, filter terakhir)
 * - Riwayat pencarian
 * - Data sementara / offline fallback cache
 */

export const localStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[LocalStorage] Gagal menyimpan key: ${key}`, e);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn(`[LocalStorage] Gagal membaca key: ${key}`, e);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn(`[LocalStorage] Gagal menghapus key: ${key}`, e);
    }
  },

  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[LocalStorage] Gagal menyimpan object: ${key}`, e);
    }
  },

  async getObject<T>(key: string): Promise<T | null> {
    try {
      const val = await AsyncStorage.getItem(key);
      if (!val) return null;
      return JSON.parse(val) as T;
    } catch (e) {
      console.warn(`[LocalStorage] Gagal membaca object: ${key}`, e);
      return null;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('[LocalStorage] Gagal menghapus seluruh storage', e);
    }
  },
};
