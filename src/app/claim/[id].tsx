import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
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

import { ImagePickerButton } from '@/components/ImagePickerButton';
import { useCampusData } from '@/context/CampusDataContext';

export default function ClaimItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getItemById, submitClaim } = useCampusData();

  const item = getItemById(id as string);

  // Form states
  const [studentName, setStudentName] = useState('');
  const [studentNim, setStudentNim] = useState('');
  const [studentFaculty, setStudentFaculty] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [proofDetails, setProofDetails] = useState('');
  const [idCardImage, setIdCardImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Barang tidak ditemukan.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSubmit = async () => {
    // Form validation
    if (!studentName.trim()) {
      Alert.alert('Form Belum Lengkap', 'Nama lengkap mahasiswa wajib diisi.');
      return;
    }
    if (!studentNim.trim()) {
      Alert.alert('Form Belum Lengkap', 'NIM wajib diisi.');
      return;
    }
    if (!studentFaculty.trim()) {
      Alert.alert('Form Belum Lengkap', 'Fakultas / Program studi wajib diisi.');
      return;
    }
    if (!studentPhone.trim()) {
      Alert.alert('Form Belum Lengkap', 'Nomor WhatsApp / HP aktif wajib diisi.');
      return;
    }
    if (!proofDetails.trim()) {
      Alert.alert(
        'Form Belum Lengkap',
        'Sebutkan ciri-ciri khusus atau rincian bukti kepemilikan barang ini.'
      );
      return;
    }
    if (!idCardImage) {
      Alert.alert(
        'Wajib Upload KTM/KTP',
        'Foto Kartu Tanda Mahasiswa (KTM) atau KTP wajib diunggah untuk verifikasi identitas resmi kampus.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitClaim({
        itemId: item.id,
        itemTitle: item.title,
        itemCategory: item.category,
        itemImage: item.image,
        studentName: studentName.trim(),
        studentNim: studentNim.trim(),
        studentFaculty: studentFaculty.trim(),
        studentPhone: studentPhone.trim(),
        proofDetails: proofDetails.trim(),
        idCardImage,
      });

      if (res.success) {
        Alert.alert(
          'Klaim Terkirim!',
          'Pengajuan klaim Anda telah dicatat dengan status "Menunggu Verifikasi". Petugas keamanan akan memeriksa kecocokan data Anda.',
          [
            {
              text: 'Lihat Status Klaim',
              onPress: () => router.replace('/claims'),
            },
          ]
        );
      } else {
        Alert.alert('Gagal', res.message || 'Terjadi kesalahan saat mengirim klaim.');
      }
    } catch (e) {
      Alert.alert('Error', 'Terjadi kesalahan koneksi data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar style="dark" />

      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 24 : 12),
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Formulir Klaim Barang</Text>
          <Text style={styles.headerSub}>Verifikasi kepemilikan civitas</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Item Summary Card */}
        <View style={styles.itemSummaryCard}>
          <Image source={{ uri: item.image }} style={styles.itemThumb} resizeMode="cover" />
          <View style={styles.itemSummaryText}>
            <Text style={styles.itemSummaryCat}>{item.category}</Text>
            <Text style={styles.itemSummaryTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.itemSummaryLoc} numberOfLines={1}>
              📍 {item.location}
            </Text>
          </View>
        </View>

        {/* Sensitive Data Notice */}
        <View style={styles.securityNoticeCard}>
          <Ionicons name="lock-closed" size={18} color="#D97706" />
          <View style={{ flex: 1 }}>
            <Text style={styles.securityNoticeTitle}>Perlindungan Data Sensitif</Text>
            <Text style={styles.securityNoticeDesc}>
              Foto KTM/KTP Anda HANYA dapat diakses dan diperiksa oleh Petugas Keamanan / Admin kampus untuk keperluan verifikasi. Data ini tidak pernah dipublikasikan.
            </Text>
          </View>
        </View>

        {/* Form Inputs */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Identitas Pemilik</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Nama Lengkap Mahasiswa <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: Muhammad Rizky Pratama"
              placeholderTextColor="#94A3B8"
              value={studentName}
              onChangeText={setStudentName}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>
                NIM <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="2210511045"
                placeholderTextColor="#94A3B8"
                value={studentNim}
                onChangeText={setStudentNim}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>
                No WhatsApp / HP <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="081234567890"
                placeholderTextColor="#94A3B8"
                value={studentPhone}
                onChangeText={setStudentPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Fakultas & Program Studi <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: Fakultas Teknik / S1 Teknik Mesin"
              placeholderTextColor="#94A3B8"
              value={studentFaculty}
              onChangeText={setStudentFaculty}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Bukti Ciri Khusus Kepemilikan <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.fieldHint}>
              Sebutkan ciri yang tidak tertera pada foto publik (misal: isi dompet, wallpaper kunci layar, nomor seri, goresan unik).
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Jelaskan ciri khusus barang Anda secara rinci..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={proofDetails}
              onChangeText={setProofDetails}
            />
          </View>

          {/* Upload Foto KTM/KTP */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Foto KTM / KTP Mahasiswa <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.fieldHint}>
              Unggah foto Kartu Tanda Mahasiswa (KTM) aktif Anda untuk verifikasi petugas.
            </Text>

            <ImagePickerButton
              imageUri={idCardImage}
              onImageSelected={(uri) => setIdCardImage(uri)}
              onImageRemoved={() => setIdCardImage('')}
              title="Unggah Foto KTM / KTP"
              subtitle="Pilih foto KTM/KTP dari galeri smartphone Anda"
              isSensitive
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Mengirim Data...' : 'Kirim Pengajuan Klaim'}
          </Text>
        </TouchableOpacity>
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
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  itemSummaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  itemThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  itemSummaryText: {
    flex: 1,
  },
  itemSummaryCat: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  itemSummaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
    marginBottom: 2,
  },
  itemSummaryLoc: {
    fontSize: 11,
    color: '#64748B',
  },
  securityNoticeCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  securityNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  securityNoticeDesc: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 16,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  required: {
    color: '#DC2626',
  },
  fieldHint: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 16,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
