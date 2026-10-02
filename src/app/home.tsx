import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ItemCard } from '@/components/ItemCard';
import { StatusBadge } from '@/components/StatusBadge';
import { StudentBottomNav } from '@/components/StudentBottomNav';
import { CAMPUS_CATEGORIES } from '@/constants/initialData';
import { useAuth } from '@/context/AuthContext';
import { useCampusData } from '@/context/CampusDataContext';
import { CampusItem } from '@/types';

/**
 * PRIORITAS 15 — HOME MAHASISWA
 * 
 * Komponen:
 * 1. Welcome / Sapaan Mahasiswa
 * 2. Banner Kampus Responsif
 * 3. Search Bar & Kategori
 * 4. Shortcut: Lapor Barang Hilang & Lihat Barang Ditemukan
 * 5. Informasi Status Laporan Mahasiswa Sendiri
 * 6. Katalog Barang Terbaru (Temuan & Hilang)
 * 7. Protected Route (Wajib Login)
 */
export default function StudentHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, role, isLoadingAuth } = useAuth();
  const { items, isLoading, isBackendConnected, refreshData } = useCampusData();

  // Protected Route Check (Prioritas 2 & 6)
  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated || !user) {
        router.replace('/login');
      } else if (role === 'admin') {
        router.replace('/admin/dashboard');
      }
    }
  }, [isAuthenticated, role, isLoadingAuth]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPoskoModal, setShowPoskoModal] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  // Laporan kehilangan milik mahasiswa yang sedang login (Prioritas 15 poin 7)
  const myReports = items.filter(
    (item) => item.type === 'lost' && (item.userId === user?.id || item.reporter?.includes(user?.name || ''))
  );

  // Katalog publik: Barang temuan + barang hilang yang disetujui
  const publicItems = items.filter((item) => {
    if (item.type === 'found') return true;
    // Barang hilang hanya tampil jika sudah disetujui admin
    return item.verificationStatus === 'Disetujui' || !item.verificationStatus;
  });

  // Filter items berdasarkan search, kategori, dan tipe
  const filteredItems = publicItems.filter((item) => {
    const matchCategory =
      selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchType = filterType === 'all' || item.type === filterType;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.faculty.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q);
    return matchCategory && matchType && matchSearch;
  });

  if (isLoadingAuth || !isAuthenticated || role !== 'student') {
    return null;
  }

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* 1. Sapaan Mahasiswa & Status Sync */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greetingSub}>Selamat Datang,</Text>
          <Text style={styles.greetingName}>{user?.name || 'Mahasiswa'}</Text>
          <Text style={styles.greetingMeta}>
            {user?.nim ? `NIM: ${user.nim}` : 'Civitas Akademika Kampus'}
          </Text>
        </View>

        <View style={styles.syncBadgeWrapper}>
          <View
            style={[
              styles.syncDot,
              { backgroundColor: isBackendConnected ? '#10B981' : '#F59E0B' },
            ]}
          />
          <Text style={styles.syncText}>
            {isBackendConnected ? 'Real-time Sync' : 'Shared Cache'}
          </Text>
        </View>
      </View>

      {/* 2. Banner Utama (Prioritas 15 & 21) */}
      <View style={styles.bannerContainer}>
        <View style={styles.bannerDecorCircle} />
        <View style={styles.bannerContent}>
          <View style={styles.bannerBadge}>
            <Ionicons name="sparkles" size={13} color="#FFFFFF" />
            <Text style={styles.bannerBadgeText}>LAYANAN KAMPUS</Text>
          </View>
          <Text style={styles.bannerTitle}>Barang Hilang atau Menemukan Barang?</Text>
          <Text style={styles.bannerDesc}>
            Laporkan melalui aplikasi dan bantu civitas kampus menemukan barangnya kembali.
          </Text>
          <View style={styles.bannerBtnRow}>
            <TouchableOpacity
              style={styles.bannerActionBtn}
              onPress={() => router.push('/report-lost')}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={16} color="#2563EB" />
              <Text style={styles.bannerActionBtnText}>Lapor Kehilangan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 3. Shortcut Utama (Prioritas 15 poin 4) */}
      <View style={styles.shortcutGrid}>
        <TouchableOpacity
          style={[styles.shortcutCard, styles.shortcutCardRed]}
          onPress={() => router.push('/report-lost')}
          activeOpacity={0.8}
        >
          <View style={[styles.shortcutIconCircle, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="alert-circle" size={22} color="#DC2626" />
          </View>
          <View style={styles.shortcutTextWrap}>
            <Text style={styles.shortcutTitle}>Lapor Kehilangan</Text>
            <Text style={styles.shortcutSubtitle}>Buat laporan barang tertinggal</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#DC2626" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shortcutCard, styles.shortcutCardGreen]}
          onPress={() => setFilterType('found')}
          activeOpacity={0.8}
        >
          <View style={[styles.shortcutIconCircle, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="search" size={20} color="#15803D" />
          </View>
          <View style={styles.shortcutTextWrap}>
            <Text style={styles.shortcutTitle}>Barang Ditemukan</Text>
            <Text style={styles.shortcutSubtitle}>Cek barang di posko keamanan</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#15803D" />
        </TouchableOpacity>
      </View>

      {/* 4. Status Laporan Mahasiswa (Prioritas 15 poin 7) */}
      {myReports.length > 0 && (
        <View style={styles.myReportsSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="newspaper-outline" size={18} color="#2563EB" />
              <Text style={styles.sectionTitle}>Status Laporan Saya</Text>
            </View>
            <Text style={styles.reportCountText}>{myReports.length} Laporan</Text>
          </View>

          {myReports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.myReportCard}
              onPress={() => router.push(`/item/${report.id}` as any)}
              activeOpacity={0.8}
            >
              <View style={styles.myReportHeader}>
                <Text style={styles.myReportTitle} numberOfLines={1}>
                  {report.title}
                </Text>
                <StatusBadge
                  status={
                    report.verificationStatus === 'Menunggu Verifikasi'
                      ? 'Menunggu Verifikasi'
                      : report.status
                  }
                  size="small"
                />
              </View>
              <Text style={styles.myReportMeta}>
                {report.location} • {report.date}
              </Text>
              {report.verificationStatus === 'Menunggu Verifikasi' && (
                <View style={styles.reportVerificationNotice}>
                  <Ionicons name="time" size={13} color="#B45309" />
                  <Text style={styles.reportVerificationText}>
                    Menunggu verifikasi admin sebelum diterbitkan ke katalog publik.
                  </Text>
                </View>
              )}
              {report.status === 'BARANG DITEMUKAN' && (
                <View style={styles.reportFoundNotice}>
                  <Ionicons name="checkmark-circle" size={14} color="#1D4ED8" />
                  <Text style={styles.reportFoundText}>
                    Barang Anda telah ditemukan oleh petugas! Silakan hubungi posko.
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 5. Search Bar & Horizontal Category Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama barang, gedung, fakultas..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CAMPUS_CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryScroll}
          renderItem={({ item: cat }) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isActive && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* 6. List Header & Filter Toggle */}
      <View style={styles.listHeaderRow}>
        <View>
          <Text style={styles.listTitle}>Katalog Barang Kampus</Text>
          <Text style={styles.listSubtitle}>
            Menampilkan {filteredItems.length} barang tercatat
          </Text>
        </View>

        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, filterType === 'all' && styles.toggleBtnActive]}
            onPress={() => setFilterType('all')}
          >
            <Text
              style={[styles.toggleText, filterType === 'all' && styles.toggleTextActive]}
            >
              Semua
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, filterType === 'found' && styles.toggleBtnActive]}
            onPress={() => setFilterType('found')}
          >
            <Text
              style={[styles.toggleText, filterType === 'found' && styles.toggleTextActive]}
            >
              Temuan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, filterType === 'lost' && styles.toggleBtnActive]}
            onPress={() => setFilterType('lost')}
          >
            <Text
              style={[styles.toggleText, filterType === 'lost' && styles.toggleTextActive]}
            >
              Hilang
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Navbar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 24 : 12),
          },
        ]}
      >
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="school" size={20} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.brandName}>
              Temu<Text style={styles.brandHighlight}>In</Text> Kampus
            </Text>
            <Text style={styles.brandTagline}>Lost & Found Civitas Akademika</Text>
          </View>
        </View>

        <View style={styles.topRightActions}>
          <TouchableOpacity
            style={styles.poskoBtn}
            onPress={() => setShowPoskoModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* List Katalog Barang (Prioritas 16: Semua Card Dapat Diklik) */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#2563EB']}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardItemWrapper}>
            <ItemCard item={item} />
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Tidak ada barang yang cocok</Text>
              <Text style={styles.emptyDesc}>
                Coba sesuaikan kata kunci pencarian, kategori, atau filter tipe barang.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Bottom Navigation */}
      <StudentBottomNav activeTab="home" />

      {/* Modal Posko Keamanan */}
      <Modal visible={showPoskoModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#2563EB" />
              <Text style={styles.modalTitle}>Posko Lost & Found Kampus</Text>
            </View>
            <Text style={styles.modalDesc}>
              Untuk verifikasi fisik dan serah terima barang temuan, silakan datangi posko resmi:
            </Text>
            <View style={styles.poskoRow}>
              <Text style={styles.poskoItemTitle}>📍 Posko Keamanan Pusat</Text>
              <Text style={styles.poskoItemSub}>Gedung Rektorat Lantai 1 (24 Jam)</Text>
            </View>
            <View style={styles.poskoRow}>
              <Text style={styles.poskoItemTitle}>📍 Resepsionis Perpustakaan</Text>
              <Text style={styles.poskoItemSub}>Lantai 2 Meja Informasi Utama</Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowPoskoModal(false)}
            >
              <Text style={styles.modalCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  brandName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  brandHighlight: {
    color: '#2563EB',
  },
  brandTagline: {
    fontSize: 11,
    color: '#64748B',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  poskoBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 24,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  greetingSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  greetingMeta: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 1,
  },
  syncBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  bannerContainer: {
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerDecorCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#2563EB',
    opacity: 0.35,
  },
  bannerContent: {
    position: 'relative',
    zIndex: 1,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  bannerBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 22,
  },
  bannerDesc: {
    fontSize: 12,
    color: '#DBEAFE',
    lineHeight: 17,
    marginBottom: 14,
  },
  bannerBtnRow: {
    flexDirection: 'row',
  },
  bannerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bannerActionBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  shortcutGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  shortcutCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  shortcutCardRed: {
    borderColor: '#FECDD3',
  },
  shortcutCardGreen: {
    borderColor: '#BBF7D0',
  },
  shortcutIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortcutTextWrap: {
    flex: 1,
  },
  shortcutTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  shortcutSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  myReportsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  reportCountText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  myReportCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  myReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  myReportTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  myReportMeta: {
    fontSize: 11,
    color: '#64748B',
  },
  reportVerificationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    padding: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  reportVerificationText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },
  reportFoundNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    padding: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  reportFoundText: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: '700',
    flex: 1,
  },
  searchSection: {
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  categoryScroll: {
    gap: 6,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  listSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  cardItemWrapper: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  poskoRow: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  poskoItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  poskoItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
