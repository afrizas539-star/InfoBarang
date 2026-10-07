import { CampusItem, ItemStatus } from '@/types';

export const CAMPUS_CATEGORIES = [
  'Semua',
  'KTM & Kartu',
  'Elektronik',
  'Alat Kuliah',
  'Kunci Kendaraan',
  'Pakaian & Buku',
  'Aksesoris & Dompet',
  'Lainnya',
];

export const CAMPUS_FACULTIES = [
  'Semua Fakultas',
  'Fakultas Ilmu Komputer',
  'Fakultas Teknik',
  'Fakultas Ekonomi & Bisnis',
  'Fakultas Kedokteran',
  'Fakultas Hukum',
  'Fakultas Ilmu Komunikasi',
  'Perpustakaan Pusat',
  'Gedung Rektorat & Administrasi',
];

export const STATUS_COLORS: Record<ItemStatus, { bg: string; text: string; border: string }> = {
  // Status Barang Hilang (Prioritas 8)
  'DALAM PENCARIAN': { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' },
  'BARANG DITEMUKAN': { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' },
  'SELESAI': { bg: '#E2E8F0', text: '#334155', border: '#94A3B8' },

  // Status Barang Temuan (Prioritas 8)
  'TERSEDIA': { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  'DIAMBIL / SELESAI': { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' },

  // Status Verifikasi Laporan Kehilangan (Prioritas 6 & 7)
  'Menunggu Verifikasi': { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  'Disetujui': { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  'Ditolak': { bg: '#FFE4E6', text: '#BE123C', border: '#FECDD3' },

  // Status Tambahan untuk kompatibilitas
  'Barang Ditemukan': { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  'Menunggu Klaim': { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  'Proses Klaim': { bg: '#E0E7FF', text: '#4338CA', border: '#C7D2FE' },
  'Terverifikasi': { bg: '#D1FAE5', text: '#047857', border: '#A7F3D0' },
  'Sudah Diambil': { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' },
  'Selesai': { bg: '#E2E8F0', text: '#334155', border: '#94A3B8' },
  'Dalam Pencarian': { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' },
  'Klaim Ditolak': { bg: '#FFE4E6', text: '#BE123C', border: '#FECDD3' },
};

// Data dummy barang & klaim telah dihapus.
// Seluruh data barang (items) dan klaim (claims) kini dikelola
// melalui Firebase Firestore (koleksi `items` dan `claims`).
// Lihat: src/services/firebase/firestoreService.ts

