import { STATUS_COLORS } from '@/constants/initialData';
import { sharedDatabase } from '@/services/database/sharedDatabase';
import {
  CampusItem,
  ClaimRequest,
  ClaimStatus,
  FoundItemStatus,
  ItemStatus,
  LostItemStatus,
  VerificationStatus,
} from '@/types';

/**
 * CampusRepository
 * Repository Pattern untuk mengelola seluruh transaksi data:
 * - Barang Hilang (Lapor, Verifikasi, Status: DALAM PENCARIAN / BARANG DITEMUKAN / SELESAI)
 * - Barang Temuan (Input Petugas, Status: TERSEDIA / DIAMBIL / SELESAI)
 * - Penghubung Barang Hilang & Temuan (Prioritas 9 & 11)
 * - Proses Klaim Berjenjang dengan Verifikasi Dokumen KTM/KTP (Prioritas 10 & 12)
 * - Sinkronisasi Database Bersama (Prioritas 4 & 5)
 */

class CampusRepository {
  /**
   * Mengambil semua item
   */
  async getAllItems(): Promise<CampusItem[]> {
    return sharedDatabase.getState().items;
  }

  /**
   * Mengambil katalog publik kampus
   * - Barang temuan yang aktif (TERSEDIA / Menunggu Klaim)
   * - Barang hilang yang TELAH DIVERIFIKASI / DISETUJUI oleh Admin
   */
  async getPublicCatalog(): Promise<CampusItem[]> {
    const all = await this.getAllItems();
    return all.filter((item) => {
      if (item.type === 'found') {
        return true; // Barang temuan petugas tampil di katalog
      }
      // Barang hilang hanya tampil jika disetujui / terverifikasi oleh Admin
      return item.verificationStatus === 'Disetujui' || !item.verificationStatus;
    });
  }

  /**
   * Mengambil daftar laporan kehilangan khusus admin (termasuk yang menunggu verifikasi)
   */
  async getLostReports(): Promise<CampusItem[]> {
    const all = await this.getAllItems();
    return all.filter((item) => item.type === 'lost');
  }

  /**
   * Mengambil laporan kehilangan milik mahasiswa tertentu
   */
  async getStudentLostReports(userId: string): Promise<CampusItem[]> {
    const all = await this.getAllItems();
    return all.filter((item) => item.type === 'lost' && item.userId === userId);
  }

  /**
   * FITUR MAHASISWA: Lapor Barang Hilang (Prioritas 6)
   * Status awal: 'Menunggu Verifikasi'
   * Status barang: 'DALAM PENCARIAN'
   */
  async reportLostItem(data: {
    title: string;
    category: string;
    description: string;
    location: string;
    date: string;
    image?: string;
    additionalInfo?: string;
    userId: string;
    reporter: string;
    faculty?: string;
  }): Promise<CampusItem> {
    const newItem: CampusItem = {
      id: `lost-${Date.now()}`,
      title: data.title.trim(),
      category: data.category,
      type: 'lost',
      status: 'DALAM PENCARIAN',
      lostStatus: 'DALAM PENCARIAN',
      verificationStatus: 'Menunggu Verifikasi', // Menunggu diverifikasi admin
      statusColor: STATUS_COLORS['DALAM PENCARIAN']?.text || '#B91C1C',
      date: data.date.trim() || 'Hari ini',
      location: data.location.trim(),
      faculty: data.faculty || 'Semua Fakultas',
      description: data.description.trim(),
      additionalInfo: data.additionalInfo?.trim() || '',
      reporter: data.reporter.trim(),
      userId: data.userId,
      image:
        data.image ||
        'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?q=80&w=600&auto=format&fit=crop',
      reward: null,
      createdAt: new Date().toISOString(),
    };

    const currentItems = sharedDatabase.getState().items;
    const updated = [newItem, ...currentItems];
    await sharedDatabase.syncPush({ items: updated });
    return newItem;
  }

  /**
   * VERIFIKASI LAPORAN KEHILANGAN OLEH ADMIN (Prioritas 7)
   */
  async verifyLostReport(
    itemId: string,
    approved: boolean,
    adminNotes?: string
  ): Promise<{ success: boolean; message: string }> {
    const currentItems = sharedDatabase.getState().items;
    const target = currentItems.find((i) => i.id === itemId);

    if (!target) {
      return { success: false, message: 'Laporan barang hilang tidak ditemukan.' };
    }

    const newVerificationStatus: VerificationStatus = approved ? 'Disetujui' : 'Ditolak';
    const updated = currentItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          verificationStatus: newVerificationStatus,
          status: (approved ? 'DALAM PENCARIAN' : 'Ditolak') as ItemStatus,
          statusColor: approved
            ? STATUS_COLORS['DALAM PENCARIAN'].text
            : STATUS_COLORS['Ditolak'].text,
          additionalInfo: adminNotes
            ? `${item.additionalInfo ? item.additionalInfo + ' | ' : ''}Catatan Admin: ${adminNotes}`
            : item.additionalInfo,
        };
      }
      return item;
    });

    await sharedDatabase.syncPush({ items: updated });
    return {
      success: true,
      message: approved
        ? 'Laporan kehilangan berhasil diverifikasi dan dipublikasikan ke katalog!'
        : 'Laporan kehilangan telah ditolak.',
    };
  }

  /**
   * INPUT BARANG TEMUAN OLEH ADMIN/PETUGAS (Prioritas 8 & 14)
   * Status: 'TERSEDIA'
   */
  async addFoundItem(data: {
    title: string;
    category: string;
    description: string;
    location: string;
    date: string;
    image: string;
    reporter: string;
    faculty?: string;
  }): Promise<CampusItem> {
    const newItem: CampusItem = {
      id: `found-${Date.now()}`,
      title: data.title.trim(),
      category: data.category,
      type: 'found',
      status: 'TERSEDIA',
      foundStatus: 'TERSEDIA',
      statusColor: STATUS_COLORS['TERSEDIA']?.text || '#15803D',
      date: data.date.trim() || 'Hari ini',
      location: data.location.trim(),
      faculty: data.faculty || 'Semua Fakultas',
      description: data.description.trim(),
      reporter: data.reporter.trim(),
      image:
        data.image ||
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop',
      reward: null,
      createdAt: new Date().toISOString(),
    };

    const currentItems = sharedDatabase.getState().items;
    const updated = [newItem, ...currentItems];
    await sharedDatabase.syncPush({ items: updated });
    return newItem;
  }

  /**
   * HUBUNGKAN BARANG HILANG DENGAN BARANG TEMUAN (Prioritas 9 & 11)
   * Menghubungkan lostItemId dengan foundItemId.
   * Status barang hilang berubah menjadi 'BARANG DITEMUKAN'.
   */
  async linkLostWithFound(
    lostItemId: string,
    foundItemId: string
  ): Promise<{ success: boolean; message: string }> {
    const currentItems = sharedDatabase.getState().items;
    const lostItem = currentItems.find((i) => i.id === lostItemId);
    const foundItem = currentItems.find((i) => i.id === foundItemId);

    if (!lostItem || !foundItem) {
      return { success: false, message: 'Data barang hilang atau temuan tidak ditemukan.' };
    }

    const updated = currentItems.map((item) => {
      if (item.id === lostItemId) {
        return {
          ...item,
          status: 'BARANG DITEMUKAN' as ItemStatus,
          lostStatus: 'BARANG DITEMUKAN' as LostItemStatus,
          statusColor: STATUS_COLORS['BARANG DITEMUKAN'].text,
          foundItemId: foundItemId,
        };
      }
      if (item.id === foundItemId) {
        return {
          ...item,
          linkedLostItemId: lostItemId,
        };
      }
      return item;
    });

    await sharedDatabase.syncPush({ items: updated });
    return {
      success: true,
      message: `Berhasil menghubungkan! Laporan "${lostItem.title}" kini berstatus BARANG DITEMUKAN.`,
    };
  }

  /**
   * Mengubah status barang secara manual (Admin)
   */
  async updateItemStatus(itemId: string, newStatus: ItemStatus): Promise<void> {
    const currentItems = sharedDatabase.getState().items;
    const updated = currentItems.map((item) => {
      if (item.id === itemId) {
        const next: CampusItem = {
          ...item,
          status: newStatus,
          statusColor: STATUS_COLORS[newStatus]?.text || item.statusColor,
        };
        if (item.type === 'lost') {
          if (newStatus === 'DALAM PENCARIAN' || newStatus === 'BARANG DITEMUKAN' || newStatus === 'SELESAI') {
            next.lostStatus = newStatus as LostItemStatus;
          }
        } else {
          if (newStatus === 'TERSEDIA' || newStatus === 'DIAMBIL / SELESAI' || newStatus === 'SELESAI') {
            next.foundStatus = (newStatus === 'SELESAI' ? 'DIAMBIL / SELESAI' : newStatus) as FoundItemStatus;
          }
        }
        return next;
      }
      return item;
    });
    await sharedDatabase.syncPush({ items: updated });
  }

  /**
   * Update item fields
   */
  async updateItem(itemId: string, updatedFields: Partial<CampusItem>): Promise<void> {
    const currentItems = sharedDatabase.getState().items;
    const updated = currentItems.map((item) => {
      if (item.id === itemId) {
        const next = { ...item, ...updatedFields };
        if (updatedFields.status) {
          next.statusColor = STATUS_COLORS[updatedFields.status]?.text || next.statusColor;
        }
        return next;
      }
      return item;
    });
    await sharedDatabase.syncPush({ items: updated });
  }

  /**
   * Hapus item
   */
  async deleteItem(itemId: string): Promise<void> {
    const currentItems = sharedDatabase.getState().items;
    const updated = currentItems.filter((i) => i.id !== itemId);
    await sharedDatabase.syncPush({ items: updated });
  }

  /**
   * PROSES KLAIM OLEH MAHASISWA (Prioritas 10 & 12)
   * Menyimpan klaim dengan lampiran sensitif foto KTM/KTP.
   * Status klaim awal: 'Menunggu Verifikasi' (Tidak boleh auto-claim!)
   */
  async submitClaim(claimData: {
    itemId: string;
    itemTitle: string;
    itemCategory: string;
    itemImage?: string;
    userId?: string;
    studentName: string;
    studentNim: string;
    studentFaculty: string;
    studentPhone: string;
    proofDetails: string;
    idCardImage: string; // FOTO KTM/KTP
  }): Promise<{ success: boolean; claimId?: string; message?: string }> {
    try {
      const newClaim: ClaimRequest = {
        ...claimData,
        id: `claim-${Date.now()}`,
        status: 'Menunggu Verifikasi',
        createdAt:
          'Hari ini • ' +
          new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
          ' WIB',
      };

      const currentClaims = sharedDatabase.getState().claims;
      const updatedClaims = [newClaim, ...currentClaims];

      // Update status item terkait menjadi 'Proses Klaim'
      await this.updateItemStatus(claimData.itemId, 'Proses Klaim');

      await sharedDatabase.syncPush({ claims: updatedClaims });

      return {
        success: true,
        claimId: newClaim.id,
        message:
          'Pengajuan klaim berhasil dikirim! Petugas keamanan akan memverifikasi dokumen KTM/KTP Anda.',
      };
    } catch {
      return { success: false, message: 'Gagal mengajukan klaim. Silakan coba kembali.' };
    }
  }

  /**
   * VERIFIKASI KLAIM OLEH PETUGAS/ADMIN (Prioritas 10 & 19)
   */
  async verifyClaim(
    claimId: string,
    approved: boolean,
    adminNotes?: string,
    adminName?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const currentClaims = sharedDatabase.getState().claims;
      const targetClaim = currentClaims.find((c) => c.id === claimId);

      if (!targetClaim) {
        return { success: false, message: 'Klaim tidak ditemukan.' };
      }

      const newClaimStatus: ClaimStatus = approved ? 'Terverifikasi' : 'Klaim Ditolak';
      const updatedClaims = currentClaims.map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            status: newClaimStatus,
            adminNotes:
              adminNotes ||
              (approved
                ? 'Klaim disetujui. Identitas KTM/KTP cocok.'
                : 'Bukti identitas atau deskripsi barang tidak cocok.'),
            verifiedAt:
              new Date().toLocaleDateString('id-ID') +
              ' • ' +
              new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
              ' WIB',
            verifiedBy: adminName || 'Petugas Keamanan Kampus',
          };
        }
        return c;
      });

      await sharedDatabase.syncPush({ claims: updatedClaims });

      // Jika disetujui, ubah status barang temuan menjadi 'DIAMBIL / SELESAI'
      if (approved) {
        await this.updateItemStatus(targetClaim.itemId, 'DIAMBIL / SELESAI');
      } else {
        // Jika ditolak, kembalikan status barang temuan ke 'TERSEDIA'
        await this.updateItemStatus(targetClaim.itemId, 'TERSEDIA');
      }

      return {
        success: true,
        message: approved
          ? 'Klaim disetujui! Barang siap diserahkan kepada mahasiswa.'
          : 'Klaim ditolak.',
      };
    } catch {
      return { success: false, message: 'Gagal memproses verifikasi klaim.' };
    }
  }

  /**
   * Subscribe ke perubahan database realtime
   */
  subscribe(listener: (state: import('../database/sharedDatabase').DatabaseState) => void) {
    return sharedDatabase.subscribe(listener);
  }

  async refreshData() {
    await sharedDatabase.pullFromBackend();
  }
}

export const campusRepository = new CampusRepository();
