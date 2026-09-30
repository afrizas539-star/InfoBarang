import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

/**
 * PRIORITAS 2 — SISTEM AUTENTIFIKASI BERBASIS ROLE
 * 
 * Pilihan Role:
 * 1. MAHASISWA: Login via NIM / Akun Mahasiswa -> Masuk ke Dashboard Mahasiswa (/home)
 * 2. ADMIN/PETUGAS: Login via Akun Gmail & Password -> Masuk ke Dashboard Petugas (/admin/dashboard)
 */
export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    isAuthenticated,
    role,
    loginAsStudent,
    loginAsAdmin,
    adminProfile,
    isLoadingAuth,
  } = useAuth();

  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('student');

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Jika sudah login, langsung arahkan ke dashboard yang sesuai
  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated && role) {
      if (role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/home');
      }
    }
  }, [isAuthenticated, role, isLoadingAuth]);

  const handleTabChange = (newRole: UserRole) => {
    setActiveRoleTab(newRole);
    setErrorMessage('');
    setIdentifier('');
    setPassword('');
  };

  const handleLogin = async () => {
    setErrorMessage('');

    // Validasi form (Prioritas 20)
    if (!identifier.trim()) {
      setErrorMessage(
        activeRoleTab === 'admin'
          ? 'Akun Gmail petugas wajib diisi.'
          : 'NIM atau Email mahasiswa wajib diisi.'
      );
      return;
    }

    if (activeRoleTab === 'admin') {
      if (!identifier.includes('@') || !identifier.includes('.')) {
        setErrorMessage('Format alamat email Gmail tidak valid.');
        return;
      }
    }

    if (!password) {
      setErrorMessage('Password wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      let res;
      if (activeRoleTab === 'admin') {
        res = await loginAsAdmin(identifier, password);
        if (res.success) {
          router.replace('/admin/dashboard');
        } else {
          setErrorMessage(res.message || 'Login admin gagal. Periksa kembali akun Gmail Anda.');
        }
      } else {
        res = await loginAsStudent(identifier, password);
        if (res.success) {
          router.replace('/home');
        } else {
          setErrorMessage(res.message || 'Login mahasiswa gagal. Periksa kembali NIM/Email.');
        }
      }
    } catch {
      setErrorMessage('Terjadi gangguan sistem autentifikasi. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo auto-fill helper
  const handleFillDemo = () => {
    setErrorMessage('');
    if (activeRoleTab === 'admin') {
      setIdentifier(adminProfile.email || 'admin.kampus@gmail.com');
      setPassword(adminProfile.password || 'admin123kampus');
    } else {
      setIdentifier('2210511045');
      setPassword('mhs123');
    }
  };

  if (isLoadingAuth) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const isAdminTab = activeRoleTab === 'admin';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 16, Platform.OS === 'android' ? 36 : 24),
            paddingBottom: Math.max(insets.bottom + 20, 30),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Image
                source={require('@/assets/images/expo-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.brandTitle}>
                Temu<Text style={styles.brandHighlight}>In</Text> Kampus
              </Text>
              <Text style={styles.brandSubtitle}>Platform Lost & Found Universitas</Text>
            </View>
          </View>
        </View>

        {/* Role Switcher Tabs */}
        <View style={styles.roleTabContainer}>
          <TouchableOpacity
            style={[styles.roleTabBtn, !isAdminTab && styles.roleTabBtnActive]}
            onPress={() => handleTabChange('student')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="school"
              size={18}
              color={!isAdminTab ? '#2563EB' : '#64748B'}
            />
            <Text style={[styles.roleTabText, !isAdminTab && styles.roleTabTextActive]}>
              Mahasiswa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTabBtn, isAdminTab && styles.roleTabBtnActiveAdmin]}
            onPress={() => handleTabChange('admin')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={isAdminTab ? '#4F46E5' : '#64748B'}
            />
            <Text style={[styles.roleTabText, isAdminTab && styles.roleTabTextActiveAdmin]}>
              Petugas / Admin
            </Text>
          </TouchableOpacity>
        </View>

        {/* Role Explanation Card */}
        <View style={[styles.roleInfoCard, isAdminTab && styles.roleInfoCardAdmin]}>
          <Ionicons
            name={isAdminTab ? 'shield-half' : 'information-circle'}
            size={20}
            color={isAdminTab ? '#4F46E5' : '#2563EB'}
          />
          <View style={styles.roleInfoTextWrap}>
            <Text style={styles.roleInfoTitle}>
              {isAdminTab ? 'Akses Pengelola Lost & Found' : 'Akses Mahasiswa & Civitas'}
            </Text>
            <Text style={styles.roleInfoDesc}>
              {isAdminTab
                ? 'Gunakan akun Gmail resmi petugas untuk mengelola barang temuan dan verifikasi klaim.'
                : 'Masuk dengan NIM/Email kampus untuk melihat katalog dan melaporkan barang hilang.'}
            </Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {isAdminTab ? 'Masuk Portal Petugas' : 'Masuk Akun Mahasiswa'}
          </Text>

          {/* Error Banner */}
          {errorMessage.length > 0 && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Identifier Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {isAdminTab ? 'Akun Gmail Petugas' : 'NIM / Email Mahasiswa'}
            </Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name={isAdminTab ? 'mail-outline' : 'person-outline'}
                size={20}
                color="#64748B"
              />
              <TextInput
                style={styles.textInput}
                placeholder={
                  isAdminTab ? 'contoh: admin.kampus@gmail.com' : 'contoh: 2210511045'
                }
                placeholderTextColor="#94A3B8"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                keyboardType={isAdminTab ? 'email-address' : 'default'}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
              <TextInput
                style={styles.textInput}
                placeholder="Masukkan kata sandi akun"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              isAdminTab ? styles.submitBtnAdmin : styles.submitBtnStudent,
              isSubmitting && styles.submitBtnDisabled,
            ]}
            onPress={handleLogin}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>
                  {isAdminTab ? 'Masuk Dashboard Admin' : 'Masuk Dashboard Mahasiswa'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Quick Demo Credentials */}
          <View style={styles.demoSection}>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={handleFillDemo}
              activeOpacity={0.7}
            >
              <Ionicons name="flash-outline" size={16} color="#64748B" />
              <Text style={styles.demoBtnText}>
                Isi Otomatis Akun Demo {isAdminTab ? 'Admin' : 'Mahasiswa'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security & Protected Route Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="lock-closed" size={14} color="#059669" />
          <Text style={styles.securityNoticeText}>
            Protected Route: Sesi login tersimpan secara aman dengan SecureStore.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandHighlight: {
    color: '#2563EB',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  roleTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  roleTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  roleTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  roleTabBtnActiveAdmin: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  roleTabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  roleTabTextActiveAdmin: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  roleInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  roleInfoCardAdmin: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  roleInfoTextWrap: {
    flex: 1,
  },
  roleInfoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  roleInfoDesc: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 18,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    gap: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    fontSize: 12,
    color: '#B91C1C',
    flex: 1,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnStudent: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
  },
  submitBtnAdmin: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  demoSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
    alignItems: 'center',
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  demoBtnText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  securityNoticeText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '500',
    textAlign: 'center',
  },
});
