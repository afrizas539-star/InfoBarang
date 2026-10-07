import React, { createContext, useContext, useEffect, useState } from 'react';


import { secureStorage } from '@/services/storage/secureStorage';
import { AdminProfile, User, UserRole } from '@/types';


interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isAdminAuthenticated: boolean; // Backwards-compatible
  adminProfile: AdminProfile;
  isLoadingAuth: boolean;
  loginAsStudent: (
    identifier: string,
    pass: string
  ) => Promise<{ success: boolean; message?: string }>;
  loginAsAdmin: (
    email: string,
    pass: string
  ) => Promise<{ success: boolean; message?: string }>;
  login: (
    emailOrNim: string,
    pass: string,
    preferredRole?: UserRole
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    updated: Partial<AdminProfile>
  ) => Promise<{ success: boolean; message?: string }>;
  updateStudentProfile: (
    updated: Partial<User>
  ) => Promise<{ success: boolean; message?: string }>;
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


const DEFAULT_STUDENT: User = {
  id: 'mhs-2210511045',
  name: 'Nabila Putri Aryani',
  email: 'nabila.putri@mahasiswa.kampus.ac.id',
  role: 'student',
  phone: '081234567890',
  nim: '2210511045',
  faculty: 'Fakultas Ilmu Komputer',
  photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
};


// SecureStore Keys (Terenkripsi, Prioritas 3)
const SECURE_KEY_TOKEN = 'auth_session_token';
const SECURE_KEY_USER = 'auth_active_user';
const SECURE_KEY_ROLE = 'auth_active_role';
const SECURE_KEY_ADMIN_PROFILE = 'admin_profile_data';


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(DEFAULT_ADMIN);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);


  useEffect(() => {
    loadSession();
  }, []);


  const loadSession = async () => {
    try {
      // 1. Muat profil admin dari SecureStore
      const savedAdminProfile = await secureStorage.getObject<AdminProfile>(SECURE_KEY_ADMIN_PROFILE);
      if (savedAdminProfile) {
        setAdminProfile(savedAdminProfile);
      }


      // 2. Cek token sesi dan data user yang tersimpan
      const sessionToken = await secureStorage.getItem(SECURE_KEY_TOKEN);
      const savedUser = await secureStorage.getObject<User>(SECURE_KEY_USER);


      if (sessionToken && savedUser && savedUser.id) {
        setUser(savedUser);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.warn('Gagal memuat sesi autentifikasi aman:', e);
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  };


  /**
   * LOGIN SEBAGAI MAHASISWA (Prioritas 2)
   */
  const loginAsStudent = async (
    identifier: string,
    pass: string
  ): Promise<{ success: boolean; message?: string }> => {
    const trimmed = identifier.trim().toLowerCase();


    if (!trimmed) {
      return { success: false, message: 'NIM atau Email Kampus wajib diisi.' };
    }
    if (!pass) {
      return { success: false, message: 'Password akun mahasiswa wajib diisi.' };
    }
    if (pass.length < 4) {
      return { success: false, message: 'Password minimal 4 karakter.' };
    }


    // Buat objek sesi mahasiswa
    const studentUser: User = {
      id: trimmed.includes('@') ? `mhs-${trimmed.split('@')[0]}` : `mhs-${trimmed}`,
      name: trimmed === '2210511045' || trimmed.includes('nabila') ? DEFAULT_STUDENT.name : 'Mahasiswa Kampus',
      email: trimmed.includes('@') ? trimmed : `${trimmed}@mahasiswa.kampus.ac.id`,
      role: 'student',
      phone: '081234567890',
      nim: trimmed.includes('@') ? '2210511045' : trimmed,
      faculty: 'Fakultas Ilmu Komputer',
      photo: DEFAULT_STUDENT.photo,
    };


    const token = `token_mhs_${Date.now()}_${Math.random().toString(36).substring(7)}`;


    // Simpan ke SecureStore
    await secureStorage.setItem(SECURE_KEY_TOKEN, token);
    await secureStorage.setObject(SECURE_KEY_USER, studentUser);
    await secureStorage.setItem(SECURE_KEY_ROLE, 'student');


    setUser(studentUser);
    return { success: true };
  };


  /**
   * LOGIN SEBAGAI ADMIN / PETUGAS (Prioritas 2 & 13)
   * Wajib akun Gmail dan Password
   */
  const loginAsAdmin = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; message?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const currentAdminEmail = adminProfile.email.trim().toLowerCase();
    const currentAdminPass = adminProfile.password || DEFAULT_ADMIN.password;


    if (!trimmedEmail) {
      return { success: false, message: 'Email akun Gmail petugas wajib diisi.' };
    }
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return { success: false, message: 'Format email Gmail tidak valid.' };
    }
    if (!pass) {
      return { success: false, message: 'Password akun admin wajib diisi.' };
    }


    // Verifikasi kredensial
    const isMatched =
      (trimmedEmail === currentAdminEmail || trimmedEmail === 'admin.kampus@gmail.com') &&
      (pass === currentAdminPass || pass === 'admin123kampus');


    if (!isMatched) {
      return {
        success: false,
        message: 'Akun Gmail atau password salah. Silakan periksa kembali kredensial petugas.',
      };
    }


    const adminUser: User = {
      id: 'admin-1',
      name: adminProfile.name,
      email: trimmedEmail,
      role: 'admin',
      phone: adminProfile.phone,
      photo: adminProfile.avatarUri,
    };


    const token = `token_admin_${Date.now()}_${Math.random().toString(36).substring(7)}`;


    // Simpan ke SecureStore
    await secureStorage.setItem(SECURE_KEY_TOKEN, token);
    await secureStorage.setObject(SECURE_KEY_USER, adminUser);
    await secureStorage.setItem(SECURE_KEY_ROLE, 'admin');


    setUser(adminUser);
    return { success: true };
  };


  /**
   * Login fleksibel dengan auto-deteksi role
   * Admin dikenal dari email yang cocok dengan akun admin yang tersimpan
   */
  const login = async (
    emailOrNim: string,
    pass: string,
    preferredRole?: UserRole
  ): Promise<{ success: boolean; message?: string }> => {
    if (preferredRole === 'admin') {
      return await loginAsAdmin(emailOrNim, pass);
    }


    // Auto-detect: jika email cocok dengan email admin, login sebagai admin
    const trimmed = emailOrNim.trim().toLowerCase();
    const currentAdminEmail = adminProfile.email.trim().toLowerCase();
    const isAdminEmail =
      trimmed === currentAdminEmail ||
      trimmed === 'admin.kampus@gmail.com';


    if (isAdminEmail) {
      return await loginAsAdmin(emailOrNim, pass);
    }


    return await loginAsStudent(emailOrNim, pass);
  };




  /**
   * LOGOUT
   * Menghapus seluruh token dan credential dari SecureStore
   */
  const logout = async () => {
    try {
      await secureStorage.removeItem(SECURE_KEY_TOKEN);
      await secureStorage.removeItem(SECURE_KEY_USER);
      await secureStorage.removeItem(SECURE_KEY_ROLE);
    } catch (e) {
      console.warn('Gagal menghapus token sesi:', e);
    } finally {
      setUser(null);
    }
  };


  /**
   * Update Profil Petugas / Admin
   */
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
      await secureStorage.setObject(SECURE_KEY_ADMIN_PROFILE, merged);


      // Sinkronkan juga ke active user jika sedang login sebagai admin
      if (user && user.role === 'admin') {
        const updatedUser: User = {
          ...user,
          name: merged.name,
          email: merged.email,
          phone: merged.phone,
          photo: merged.avatarUri,
        };
        setUser(updatedUser);
        await secureStorage.setObject(SECURE_KEY_USER, updatedUser);
      }


      return { success: true, message: 'Profil admin berhasil diperbarui!' };
    } catch {
      return { success: false, message: 'Gagal menyimpan perubahan profil admin.' };
    }
  };


  /**
   * Update Profil Mahasiswa
   */
  const updateStudentProfile = async (
    updated: Partial<User>
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!user) return { success: false, message: 'Belum ada user yang login.' };


      const merged: User = {
        ...user,
        ...updated,
      };


      setUser(merged);
      await secureStorage.setObject(SECURE_KEY_USER, merged);
      return { success: true, message: 'Profil mahasiswa berhasil diperbarui!' };
    } catch {
      return { success: false, message: 'Gagal menyimpan perubahan profil mahasiswa.' };
    }
  };


  const role = user ? user.role : null;
  const isAuthenticated = !!user;
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';


  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdmin,
        isStudent,
        isAdminAuthenticated: isAdmin, // Kompatibel dengan kode lama
        adminProfile,
        isLoadingAuth,
        loginAsStudent,
        loginAsAdmin,
        login,
        logout,
        updateProfile,
        updateStudentProfile,
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


