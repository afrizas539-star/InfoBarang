import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { INITIAL_CAMPUS_ITEMS, INITIAL_CLAIMS, STATUS_COLORS } from '@/constants/initialData';
import { CampusItem, ClaimRequest, ClaimStatus, ItemStatus } from '@/types';

interface CampusDataContextType {
  items: CampusItem[];
  claims: ClaimRequest[];
  isLoading: boolean;
  addItem: (item: Omit<CampusItem, 'id' | 'createdAt'>) => Promise<CampusItem>;
  updateItemStatus: (itemId: string, newStatus: ItemStatus) => Promise<void>;
  updateItem: (itemId: string, updatedFields: Partial<CampusItem>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  submitClaim: (
    claim: Omit<ClaimRequest, 'id' | 'createdAt' | 'status'>
  ) => Promise<{ success: boolean; claimId?: string; message?: string }>;
  verifyClaim: (
    claimId: string,
    approved: boolean,
    adminNotes?: string
  ) => Promise<{ success: boolean; message?: string }>;
  getItemById: (id: string) => CampusItem | undefined;
  getClaimById: (id: string) => ClaimRequest | undefined;
  refreshData: () => Promise<void>;
}

const STORAGE_KEY_ITEMS = '@temuin_campus_items';
const STORAGE_KEY_CLAIMS = '@temuin_campus_claims';

const CampusDataContext = createContext<CampusDataContextType | undefined>(undefined);

export const CampusDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CampusItem[]>(INITIAL_CAMPUS_ITEMS);
  const [claims, setClaims] = useState<ClaimRequest[]>(INITIAL_CLAIMS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedItems = await AsyncStorage.getItem(STORAGE_KEY_ITEMS);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      } else {
        await AsyncStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_CAMPUS_ITEMS));
      }

      const storedClaims = await AsyncStorage.getItem(STORAGE_KEY_CLAIMS);
      if (storedClaims) {
        setClaims(JSON.parse(storedClaims));
      } else {
        await AsyncStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(INITIAL_CLAIMS));
      }
    } catch (e) {
      console.warn('Gagal memuat data lokal kampus:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const persistItems = async (newItems: CampusItem[]) => {
    setItems(newItems);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(newItems));
    } catch (e) {
      console.warn('Gagal menyimpan items:', e);
    }
  };

  const persistClaims = async (newClaims: ClaimRequest[]) => {
    setClaims(newClaims);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(newClaims));
    } catch (e) {
      console.warn('Gagal menyimpan klaim:', e);
    }
  };

  const addItem = async (itemData: Omit<CampusItem, 'id' | 'createdAt'>): Promise<CampusItem> => {
    const newItem: CampusItem = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      statusColor: STATUS_COLORS[itemData.status]?.text || '#15803D',
    };
    const updated = [newItem, ...items];
    await persistItems(updated);
    return newItem;
  };

  const updateItemStatus = async (itemId: string, newStatus: ItemStatus) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          status: newStatus,
          statusColor: STATUS_COLORS[newStatus]?.text || item.statusColor,
        };
      }
      return item;
    });
    await persistItems(updated);
  };

  const updateItem = async (itemId: string, updatedFields: Partial<CampusItem>) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        const next = { ...item, ...updatedFields };
        if (updatedFields.status) {
          next.statusColor = STATUS_COLORS[updatedFields.status]?.text || next.statusColor;
        }
        return next;
      }
      return item;
    });
    await persistItems(updated);
  };

  const deleteItem = async (itemId: string) => {
    const updated = items.filter((item) => item.id !== itemId);
    await persistItems(updated);
  };

  const submitClaim = async (
    claimData: Omit<ClaimRequest, 'id' | 'createdAt' | 'status'>
  ): Promise<{ success: boolean; claimId?: string; message?: string }> => {
    try {
      const newClaim: ClaimRequest = {
        ...claimData,
        id: `claim-${Date.now()}`,
        status: 'Menunggu Verifikasi',
        createdAt: 'Hari ini • ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      };

      const updatedClaims = [newClaim, ...claims];
      await persistClaims(updatedClaims);

      // Otomatis sinkronisasi status barang menjadi "Proses Klaim"
      await updateItemStatus(claimData.itemId, 'Proses Klaim');

      return { success: true, claimId: newClaim.id, message: 'Klaim berhasil dikirim! Menunggu verifikasi petugas.' };
    } catch (e) {
      return { success: false, message: 'Gagal mengajukan klaim. Silakan coba lagi.' };
    }
  };

  const verifyClaim = async (
    claimId: string,
    approved: boolean,
    adminNotes?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const targetClaim = claims.find((c) => c.id === claimId);
      if (!targetClaim) {
        return { success: false, message: 'Klaim tidak ditemukan.' };
      }

      const newClaimStatus: ClaimStatus = approved ? 'Terverifikasi' : 'Klaim Ditolak';
      const updatedClaims = claims.map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            status: newClaimStatus,
            adminNotes: adminNotes || (approved ? 'Klaim disetujui oleh Petugas Keamanan.' : 'Bukti identitas tidak cocok.'),
            verifiedAt: new Date().toLocaleDateString('id-ID') + ' • ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          };
        }
        return c;
      });

      await persistClaims(updatedClaims);

      // Perbarui status barang yang diklaim
      if (approved) {
        await updateItemStatus(targetClaim.itemId, 'Terverifikasi');
      } else {
        await updateItemStatus(targetClaim.itemId, 'Menunggu Klaim');
      }

      return {
        success: true,
        message: approved
          ? 'Klaim berhasil disetujui! Barang siap diserahkan kepada mahasiswa.'
          : 'Klaim telah ditolak dengan catatan verifikasi.',
      };
    } catch (e) {
      return { success: false, message: 'Gagal memproses verifikasi klaim.' };
    }
  };

  const getItemById = (id: string) => {
    return items.find((item) => item.id === id);
  };

  const getClaimById = (id: string) => {
    return claims.find((c) => c.id === id);
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <CampusDataContext.Provider
      value={{
        items,
        claims,
        isLoading,
        addItem,
        updateItemStatus,
        updateItem,
        deleteItem,
        submitClaim,
        verifyClaim,
        getItemById,
        getClaimById,
        refreshData,
      }}
    >
      {children}
    </CampusDataContext.Provider>
  );
};

export const useCampusData = () => {
  const context = useContext(CampusDataContext);
  if (!context) {
    throw new Error('useCampusData must be used within a CampusDataProvider');
  }
  return context;
};
