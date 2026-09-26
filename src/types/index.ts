export type ItemType = 'lost' | 'found';

export type ItemStatus =
  | 'Barang Ditemukan'
  | 'Menunggu Klaim'
  | 'Proses Klaim'
  | 'Terverifikasi'
  | 'Sudah Diambil'
  | 'Selesai'
  | 'Dalam Pencarian'
  | 'Klaim Ditolak';

export interface CampusItem {
  id: string;
  title: string;
  category: string;
  type: ItemType;
  status: ItemStatus;
  statusColor: string;
  date: string;
  location: string;
  faculty: string;
  description: string;
  reward?: string | null;
  reporter: string;
  image: string;
  createdAt?: string;
}

export type ClaimStatus = 'Menunggu Verifikasi' | 'Terverifikasi' | 'Klaim Ditolak';

export interface ClaimRequest {
  id: string;
  itemId: string;
  itemTitle: string;
  itemCategory: string;
  itemImage?: string;
  studentName: string;
  studentNim: string;
  studentFaculty: string;
  studentPhone: string;
  proofDetails: string;
  idCardImage: string; // SENSITIVE: KTM/KTP URI
  status: ClaimStatus;
  adminNotes?: string;
  createdAt: string;
  verifiedAt?: string;
}

export interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  password?: string;
  avatarUri?: string;
  role: string;
  officeLocation: string;
}
