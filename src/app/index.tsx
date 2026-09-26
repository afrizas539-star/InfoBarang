import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CampusBanner } from '@/components/CampusBanner';
import { ItemCard } from '@/components/ItemCard';
import { StudentBottomNav } from '@/components/StudentBottomNav';
import { CAMPUS_CATEGORIES } from '@/constants/initialData';
import { useCampusData } from '@/context/CampusDataContext';

export default function StudentHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, isLoading } = useCampusData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [showPoskoModal, setShowPoskoModal] = useState(false);

  // Filter items
  const filteredItems = items.filter((item) => {
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

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari KTM, alat kuliah, fakultas, gedung..."
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

        {/* Category Horizontal Filter */}
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

      {/* Banner Home Kampus */}
      <CampusBanner onPressInfo={() => setShowPoskoModal(true)} />

      {/* Info Petugas Box */}
      <View style={styles.campusNoticeCard}>
        <View style={styles.noticeIconWrap}>
          <Ionicons name="information-circle" size={20} color="#2563EB" />
        </View>
        <View style={styles.noticeTextWrap}>
          <Text style={styles.noticeTitle}>Ingin Melapor Barang Hilang / Temuan?</Text>
          <Text style={styles.noticeDesc}>
            Mahasiswa tidak dapat menginput laporan mandiri di aplikasi. Silakan datangi Pos Satpam atau TU Fakultas agar diverifikasi petugas resmi.
          </Text>
        </View>
      </View>

      {/* Header List & Tipe Filter Toggle */}
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
              style={[
                styles.toggleText,
                filterType === 'all' && styles.toggleTextActive,
              ]}
            >
              Semua
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, filterType === 'found' && styles.toggleBtnActive]}
            onPress={() => setFilterType('found')}
          >
            <Text
              style={[
                styles.toggleText,
                filterType === 'found' && styles.toggleTextActive,
              ]}
            >
              Temuan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, filterType === 'lost' && styles.toggleBtnActive]}
            onPress={() => setFilterType('lost')}
          >
            <Text
              style={[
                styles.toggleText,
                filterType === 'lost' && styles.toggleTextActive,
              ]}
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
            <Ionicons name="school" size={22} color="#2563EB" />
          </View>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandName}>
                Temu<Text style={styles.brandHighlight}>In</Text>
              </Text>
              <View style={styles.campusBadge}>
                <Text style={styles.campusBadgeText}>Kampus</Text>
              </View>
            </View>
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

          <TouchableOpacity
            style={styles.adminPortalBtn}
            onPress={() => router.push('/admin/login')}
            activeOpacity={0.8}
          >
            <Ionicons name="lock-closed-outline" size={14} color="#2563EB" />
            <Text style={styles.adminPortalBtnText}>Admin</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List of Items */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
                Coba sesuaikan kata kunci pencarian, kategori, atau filter tipe laporan.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Bottom Navigation */}
      <StudentBottomNav activeTab="home" />

      {/* Modal Posko Keamanan Kampus */}
      <Modal
        visible={showPoskoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPoskoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIcon}>
                <Ionicons name="shield-checkmark" size={24} color="#2563EB" />
              </View>
              <Text style={styles.modalTitle}>Posko Lost & Found Kampus</Text>
              <TouchableOpacity
                onPress={() => setShowPoskoModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescText}>
              Untuk keamanan seluruh civitas akademika, serah terima barang temuan maupun pelaporan barang hilang wajib dilakukan secara langsung:
            </Text>

            <View style={styles.contactItem}>
              <Ionicons name="location" size={18} color="#DC2626" />
              <View style={styles.contactTextWrap}>
                <Text style={styles.contactLabel}>Posko Satpam Utama</Text>
                <Text style={styles.contactValue}>
                  Gerbang Utama Kampus & Gedung Rektorat Lt. 1
                </Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <Ionicons name="call" size={18} color="#059669" />
              <View style={styles.contactTextWrap}>
                <Text style={styles.contactLabel}>Telepon Darurat Kampus</Text>
                <Text style={styles.contactValue}>(021) 789-0000 • Ext. 101</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <Ionicons name="time" size={18} color="#D97706" />
              <View style={styles.contactTextWrap}>
                <Text style={styles.contactLabel}>Jam Layanan Fisik</Text>
                <Text style={styles.contactValue}>24 Jam Setiap Hari (Pos Keamanan)</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => setShowPoskoModal(false)}
            >
              <Text style={styles.modalPrimaryBtnText}>Saya Mengerti</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  brandHighlight: {
    color: '#2563EB',
  },
  campusBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  campusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  brandTagline: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  poskoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminPortalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  adminPortalBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  listContainer: {
    paddingBottom: 24,
  },
  headerContent: {
    paddingTop: 12,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  campusNoticeCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  noticeIconWrap: {
    marginTop: 2,
  },
  noticeTextWrap: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 3,
  },
  noticeDesc: {
    fontSize: 11,
    color: '#3B82F6',
    lineHeight: 16,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  listSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalDescText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactTextWrap: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  contactValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  modalPrimaryBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});