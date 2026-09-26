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
  'Barang Ditemukan': { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  'Menunggu Klaim': { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  'Proses Klaim': { bg: '#E0E7FF', text: '#4338CA', border: '#C7D2FE' },
  'Terverifikasi': { bg: '#D1FAE5', text: '#047857', border: '#A7F3D0' },
  'Sudah Diambil': { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' },
  'Selesai': { bg: '#E2E8F0', text: '#334155', border: '#94A3B8' },
  'Dalam Pencarian': { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' },
  'Klaim Ditolak': { bg: '#FFE4E6', text: '#BE123C', border: '#FECDD3' },
};

export const INITIAL_CAMPUS_ITEMS: CampusItem[] = [
  {
    id: '1',
    title: 'KTM & Lanyard a.n Nabila Putri',
    category: 'KTM & Kartu',
    type: 'found',
    status: 'Menunggu Klaim',
    statusColor: '#B45309',
    date: 'Hari ini • 10:15 WIB',
    location: 'Perpustakaan Pusat Lantai 2 (Meja Belajar)',
    faculty: 'Fakultas Ilmu Komputer',
    description:
      'Kartu Tanda Mahasiswa (KTM) a.n Nabila Putri (NIM: 2210511***), lanyard biru dongker, dan kartu e-money. Dititipkan di meja resepsionis perpustakaan.',
    reward: null,
    reporter: 'Riko (Petugas Perpus)',
    image:
      'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?q=80&w=600&auto=format&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Kalkulator Saintifik Casio fx-991EX',
    category: 'Alat Kuliah',
    type: 'lost',
    status: 'Dalam Pencarian',
    statusColor: '#B91C1C',
    date: 'Kemarin • 15:40 WIB',
    location: 'Gedung Kuliah Bersama (GKB) Ruang 402',
    faculty: 'Fakultas Teknik',
    description:
      'Kalkulator Casio warna hitam putih dengan stiker barcode jurusan di bagian tutup belakang. Sangat dibutuhkan untuk praktikum.',
    reward: 'Traktir Kopi / Makan Siang',
    reporter: 'Fajar Nugraha (Mhs Teknik Sipil)',
    image:
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?q=80&w=600&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Kunci Motor Honda Vario + Gantungan Lab',
    category: 'Kunci Kendaraan',
    type: 'found',
    status: 'Barang Ditemukan',
    statusColor: '#15803D',
    date: '23 Sep • 08:30 WIB',
    location: 'Parkiran Sepeda Motor Gedung Dosen',
    faculty: 'Semua Fakultas',
    description:
      'Kunci remote keyless dengan gantungan akrilik bertuliskan "Lab Jaringan". Ditemukan tergantung di slot jok motor dan diamankan di Pos Keamanan.',
    reward: null,
    reporter: 'Pak Joko (Satpam Kampus)',
    image:
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=600&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '4',
    title: 'Jaket Almamater & Binder Catatan',
    category: 'Pakaian & Buku',
    type: 'lost',
    status: 'Dalam Pencarian',
    statusColor: '#B91C1C',
    date: '22 Sep • 17:00 WIB',
    location: 'Kantin Pusat / Gazebo Mahasiswa',
    faculty: 'Fakultas Ekonomi & Bisnis',
    description:
      'Jaket Almamater ukuran L, di dalamnya terdapat binder catatan mata kuliah Akuntansi Biaya serta flashdisk 32GB.',
    reward: 'Ada Imbalan',
    reporter: 'Dina Safitri (FEB 2024)',
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: '5',
    title: 'Charger Laptop MacBook Type-C 67W',
    category: 'Elektronik',
    type: 'found',
    status: 'Menunggu Klaim',
    statusColor: '#B45309',
    date: '22 Sep • 13:10 WIB',
    location: 'Coworking Space / Student Center Lt. 1',
    faculty: 'Fakultas Ilmu Komunikasi',
    description:
      'Adaptor warna putih dengan kabel braided type-C. Ada stiker kecil di ujung adaptor. Dititipkan pada loker posko barang temuan.',
    reward: null,
    reporter: 'Arya Raditya (Fikom 2023)',
    image:
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: '6',
    title: 'Dompet Kulit Hitam Eiger',
    category: 'Aksesoris & Dompet',
    type: 'found',
    status: 'Proses Klaim',
    statusColor: '#4338CA',
    date: '20 Sep • 14:00 WIB',
    location: 'Gedung Kuliah Bersama (GKB) 3 Lt. 2',
    faculty: 'Fakultas Teknik',
    description:
      'Dompet lipat warna hitam merk Eiger. Ditemukan di bawah kursi deret tengah ruang 201. Identitas uang dan kartu telah dicatat satpam.',
    reward: null,
    reporter: 'Pak Bambang (Petugas Kebersihan)',
    image:
      'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
];

export const INITIAL_CLAIMS: import('@/types').ClaimRequest[] = [
  {
    id: 'claim-1',
    itemId: '6',
    itemTitle: 'Dompet Kulit Hitam Eiger',
    itemCategory: 'Aksesoris & Dompet',
    itemImage:
      'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600&auto=format&fit=crop',
    studentName: 'Muhammad Rizky Pratama',
    studentNim: '2210511045',
    studentFaculty: 'Fakultas Teknik',
    studentPhone: '081234567890',
    proofDetails:
      'Dompet saya tertinggal di GKB 3 setelah kuliah Kalkulus. Di dalamnya ada kartu SIM C atas nama saya dan struk ATM.',
    idCardImage:
      'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?q=80&w=600&auto=format&fit=crop',
    status: 'Menunggu Verifikasi',
    createdAt: '21 Sep 2026 • 09:30 WIB',
  },
];
