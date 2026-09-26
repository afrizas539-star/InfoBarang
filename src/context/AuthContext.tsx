import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { AdminProfile } from '@/types';

interface AuthContextType {
  isAdminAuthenticated: boolean;
  adminProfile: AdminProfile;
  isLoadingAuth: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<AdminProfile>) => Promise<{ success: boolean; message?: string }>;
}

const DEFAULT_ADMIN: AdminProfile = {
  name: 'Budi Santoso, S.Sos',
  email: 'admin.kampus@gmail.com',
  password: 'admin123kampus',
  phone: '081298765432',
  avatarUri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  role: 'Petugas Pengelola Lost & Found Kampus',
  officeLocation: 'Posko Keamanan Pusat (Gedung Rektorat Lt. 1)',
};

const STORAGE_KEY_AUTH = '@temuin_admin_session';
const STORAGE_KEY_PROFILE = '@temuin_admin_profile';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(DEFAULT_ADMIN);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem(STORAGE_KEY_PROFILE);
      if (savedProfile) {
        setAdminProfile(JSON.parse(savedProfile));
      }
      const savedSession = await AsyncStorage.getItem(STORAGE_KEY_AUTH);
      if (savedSession === 'true') {
        setIsAdminAuthenticated(true);
      }
    } catch (e) {
      console.warn('Gagal memuat sesi admin:', e);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; message?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const currentProfileEmail = adminProfile.email.trim().toLowerCase();
    const currentProfilePass = adminProfile.password || DEFAULT_ADMIN.password;

    if (!trimmedEmail) {
      return { success: false, message: 'Email Gmail wajib diisi.' };
    }
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return { success: false, message: 'Format alamat email tidak valid.' };
    }
    if (!pass) {
      return { success: false, message: 'Password wajib diisi.' };
    }

    if (trimmedEmail === currentProfileEmail && pass === currentProfilePass) {
      setIsAdminAuthenticated(true);
      await AsyncStorage.setItem(STORAGE_KEY_AUTH, 'true');
      return { success: true };
    }

    return {
      success: false,
      message: 'Email atau password salah. Silakan periksa kembali akun Gmail Anda.',
    };
  };

  const logout = async () => {
    setIsAdminAuthenticated(false);
    await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
  };

  const updateProfile = async (
    updated: Partial<AdminProfile>
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const merged: AdminProfile = {
        ...adminProfile,
        ...updated,
      };

      if (!merged.name.trim()) {
        return { success: false, message: 'Nama petugas tidak boleh kosong.' };
      }
      if (!merged.email.trim() || !merged.email.includes('@')) {
        return { success: false, message: 'Email akun Gmail tidak valid.' };
      }

      setAdminProfile(merged);
      await AsyncStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(merged));
      return { success: true, message: 'Profil admin berhasil diperbarui!' };
    } catch (e) {
      return { success: false, message: 'Gagal menyimpan perubahan profil.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminProfile,
        isLoadingAuth,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
