import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import { AdminProfile, CampusItem, ClaimRequest, User, UserRole } from '@/types';

// Koleksi Firestore
const ITEMS_COLLECTION = 'items';
const CLAIMS_COLLECTION = 'claims';
const ADMINS_COLLECTION = 'admins';
const USERS_COLLECTION = 'users';

/**
 * Validasi domain email sesuai kebijakan kampus:
 * - Mahasiswa: Harus berakhiran tepat @webmail.umm.ac.id
 * - Petugas: Harus berakhiran tepat @umm.ac.id (dan BUKAN @webmail.umm.ac.id)
 */
export function validateEmailDomain(email: string): {
  isValid: boolean;
  role: UserRole | null;
  errorMessage?: string;
} {
  const normalized = email.trim().toLowerCase();

  if (!normalized || !normalized.includes('@')) {
    return {
      isValid: false,
      role: null,
      errorMessage: 'Format email tidak valid. Masukkan email resmi kampus.',
    };
  }

  // 1. Mahasiswa: Harus berakhiran tepat @webmail.umm.ac.id
  if (normalized.endsWith('@webmail.umm.ac.id')) {
    const prefix = normalized.split('@webmail.umm.ac.id')[0];
    if (!prefix || prefix.includes('@')) {
      return {
        isValid: false,
        role: null,
        errorMessage: 'Alamat email mahasiswa tidak valid.',
      };
    }
    return {
      isValid: true,
      role: 'student',
    };
  }

  // 2. Petugas: Harus berakhiran tepat @umm.ac.id dan bukan @webmail.umm.ac.id
  if (normalized.endsWith('@umm.ac.id')) {
    const prefix = normalized.split('@umm.ac.id')[0];
    if (!prefix || prefix.includes('@')) {
      return {
        isValid: false,
        role: null,
        errorMessage: 'Alamat email petugas tidak valid.',
      };
    }
    return {
      isValid: true,
      role: 'admin',
    };
  }

  // 3. Domain di luar UMM ditolak
  return {
    isValid: false,
    role: null,
    errorMessage:
      'Domain email tidak diizinkan. Gunakan @webmail.umm.ac.id untuk mahasiswa atau @umm.ac.id untuk petugas.',
  };
}

export const DEFAULT_ADMIN_DATA: AdminProfile = {
  name: 'Budi Santoso, S.Sos',
  email: 'petugas@umm.ac.id',
  password: 'admin123kampus',
  phone: '081298765432',
  avatarUri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  role: 'Petugas Pengelola Lost & Found Kampus',
  officeLocation: 'Posko Keamanan Pusat (Gedung Rektorat Lt. 1)',
};

// ─── ADMINS & USERS ───────────────────────────────────────────────────────────

/**
 * Cari akun admin di Firestore berdasarkan email.
 */
export async function getAdminByEmailFromFirestore(email: string): Promise<AdminProfile | null> {
  try {
    const normalized = email.trim().toLowerCase();
    const q = query(
      collection(db, ADMINS_COLLECTION),
      where('email', '==', normalized)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as AdminProfile;
    }

    // Periksa juga di koleksi users jika disimpan di users dengan role admin
    const qUsers = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', normalized),
      where('role', 'in', ['admin', 'Petugas Pengelola Lost & Found Kampus'])
    );
    const snapUsers = await getDocs(qUsers);
    if (!snapUsers.empty) {
      const uData = snapUsers.docs[0].data();
      return {
        name: uData.name || 'Petugas Kampus',
        email: uData.email,
        phone: uData.phone || '081234567890',
        avatarUri: uData.photo || uData.avatarUri || '',
        role: 'Petugas Pengelola Lost & Found Kampus',
        officeLocation: uData.officeLocation || 'Posko Keamanan Pusat',
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching admin by email from Firestore:', error);
    return null;
  }
}

/**
 * Cari profil mahasiswa di Firestore (koleksi users).
 */
export async function getUserProfileFromFirestore(email: string): Promise<User | null> {
  try {
    const normalized = email.trim().toLowerCase();
    const q = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', normalized)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docData = snapshot.docs[0];
      return { id: docData.id, ...(docData.data() as Omit<User, 'id'>) };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile from Firestore:', error);
    return null;
  }
}

/**
 * Simpan profil mahasiswa ke Firestore (koleksi users).
 */
export async function saveUserProfileToFirestore(user: User): Promise<void> {
  try {
    const ref = collection(db, USERS_COLLECTION);
    await addDoc(ref, {
      ...user,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Gagal menyimpan profil mahasiswa ke Firestore:', error);
  }
}

/**
 * Memastikan minimal ada 1 akun admin default di Firestore (auto-seed jika kosong).
 */
export async function ensureDefaultAdminInFirestore(): Promise<AdminProfile> {
  const existing = await getAdminByEmailFromFirestore(DEFAULT_ADMIN_DATA.email);
  if (existing) return existing;

  const ref = collection(db, ADMINS_COLLECTION);
  await addDoc(ref, {
    ...DEFAULT_ADMIN_DATA,
    createdAt: new Date().toISOString(),
  });
  return DEFAULT_ADMIN_DATA;
}


// ─── ITEMS ────────────────────────────────────────────────────────────────────

/**
 * Tambahkan dokumen barang baru ke koleksi `items`.
 * Menggunakan addDoc agar Firestore auto-generate ID.
 */
export async function addItemToFirestore(
  itemData: Omit<CampusItem, 'id'>
): Promise<CampusItem> {
  const ref = collection(db, ITEMS_COLLECTION);

  // Filter out any undefined fields so Firestore addDoc never throws invalid data error
  const cleanData: Record<string, unknown> = {};
  Object.entries(itemData).forEach(([key, val]) => {
    if (val !== undefined) {
      cleanData[key] = val;
    }
  });

  const createdAt = new Date().toISOString();
  const docRef = await addDoc(ref, {
    ...cleanData,
    createdAt,
  });

  return { id: docRef.id, ...itemData, createdAt };
}

/**
 * Ambil semua barang dari Firestore (one-time fetch).
 */
export async function getAllItemsFromFirestore(): Promise<CampusItem[]> {
  const q = query(
    collection(db, ITEMS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CampusItem, 'id'>) }));
}

/**
 * Perbarui field barang tertentu di Firestore.
 */
export async function updateItemInFirestore(
  itemId: string,
  updatedFields: Partial<CampusItem>
): Promise<void> {
  const ref = doc(db, ITEMS_COLLECTION, itemId);
  await updateDoc(ref, updatedFields as Record<string, unknown>);
}

/**
 * Hapus barang dari Firestore.
 */
export async function deleteItemFromFirestore(itemId: string): Promise<void> {
  const ref = doc(db, ITEMS_COLLECTION, itemId);
  await deleteDoc(ref);
}

/**
 * Subscribe realtime ke koleksi `items`.
 * Mengembalikan fungsi unsubscribe.
 */
export function subscribeToItems(
  callback: (items: CampusItem[]) => void
): Unsubscribe {
  const q = query(
    collection(db, ITEMS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<CampusItem, 'id'>),
    }));
    callback(items);
  });
}

// ─── CLAIMS ───────────────────────────────────────────────────────────────────

/**
 * Tambahkan klaim baru ke koleksi `claims`.
 */
export async function addClaimToFirestore(
  claimData: Omit<ClaimRequest, 'id'>
): Promise<ClaimRequest> {
  const ref = collection(db, CLAIMS_COLLECTION);

  const cleanData: Record<string, unknown> = {};
  Object.entries(claimData).forEach(([key, val]) => {
    if (val !== undefined) {
      cleanData[key] = val;
    }
  });

  const createdAt = new Date().toISOString();
  const docRef = await addDoc(ref, {
    ...cleanData,
    createdAt,
  });

  return { id: docRef.id, ...claimData };
}

/**
 * Ambil semua klaim dari Firestore (one-time fetch).
 */
export async function getAllClaimsFromFirestore(): Promise<ClaimRequest[]> {
  const q = query(
    collection(db, CLAIMS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ClaimRequest, 'id'>) }));
}

/**
 * Perbarui field klaim tertentu di Firestore.
 */
export async function updateClaimInFirestore(
  claimId: string,
  updatedFields: Partial<ClaimRequest>
): Promise<void> {
  const ref = doc(db, CLAIMS_COLLECTION, claimId);
  await updateDoc(ref, updatedFields as Record<string, unknown>);
}

/**
 * Subscribe realtime ke koleksi `claims`.
 */
export function subscribeToClaims(
  callback: (claims: ClaimRequest[]) => void
): Unsubscribe {
  const q = query(
    collection(db, CLAIMS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const claims = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ClaimRequest, 'id'>),
    }));
    callback(claims);
  });
}
