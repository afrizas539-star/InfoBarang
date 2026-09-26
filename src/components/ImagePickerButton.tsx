import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ImagePickerButtonProps {
  imageUri?: string;
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
  title?: string;
  subtitle?: string;
  aspect?: [number, number];
  isSensitive?: boolean;
}

export const ImagePickerButton: React.FC<ImagePickerButtonProps> = ({
  imageUri,
  onImageSelected,
  onImageRemoved,
  title = 'Upload Foto',
  subtitle = 'Pilih foto dari galeri HP Anda',
  aspect = [4, 3],
  isSensitive = false,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      setLoading(true);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Izin Galeri Diperlukan',
          'Aplikasi membutuhkan izin akses galeri untuk mengupload foto.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Gagal memilih gambar:', e);
      Alert.alert('Error', 'Gagal membuka galeri foto. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />

          {isSensitive && (
            <View style={styles.sensitiveOverlayBadge}>
              <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
              <Text style={styles.sensitiveText}>Dokumen Rahasia (KTM/KTP)</Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.smallBtn, styles.replaceBtn]}
              onPress={handlePickImage}
              disabled={loading}
            >
              <Ionicons name="refresh" size={14} color="#2563EB" />
              <Text style={styles.replaceBtnText}>Ganti Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.smallBtn, styles.removeBtn]}
              onPress={onImageRemoved}
            >
              <Ionicons name="trash-outline" size={14} color="#DC2626" />
              <Text style={styles.removeBtnText}>Hapus</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.75}
          style={[styles.uploadBox, isSensitive && styles.sensitiveBox]}
          onPress={handlePickImage}
          disabled={loading}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isSensitive ? '#FEF3C7' : '#EFF6FF' },
            ]}
          >
            <Ionicons
              name={isSensitive ? 'card-outline' : 'camera-outline'}
              size={26}
              color={isSensitive ? '#D97706' : '#2563EB'}
            />
          </View>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.subtitleText}>{subtitle}</Text>
          <View style={styles.ctaPill}>
            <Ionicons name="image-outline" size={14} color="#475569" />
            <Text style={styles.ctaPillText}>Buka Galeri</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensitiveBox: {
    borderColor: '#FCD34D',
    backgroundColor: '#FFFDF5',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ctaPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  previewContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  previewImage: {
    width: '100%',
    height: 190,
  },
  sensitiveOverlayBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  sensitiveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  replaceBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  replaceBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  removeBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
});
