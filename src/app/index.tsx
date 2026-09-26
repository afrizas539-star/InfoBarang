import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Data Mock Barang Hilang & Ditemukan di Lingkup Kampus
const INITIAL_CAMPUS_ITEMS = [
  {
    id: '1',
    title: 'KTM & Lanyard a.n Nabila Putri',
    category: 'KTM & Kartu',
    type: 'found',
    status: 'Diamankan di Pos Satpam',
    statusColor: '#10B981',
    date: 'Hari ini • 10:15 WIB',
    location: 'Perpustakaan Pusat Lantai 2 (Meja Belajar)',
    faculty: 'Fakultas Ilmu Komputer',
    description:
      'Kartu Tanda Mahasiswa (KTM) a.n Nabila Putri (NIM: 2210511***), lanyard biru dongker, dan kartu e-money. Dititipkan di meja resepsionis perpustakaan.',
    reward: null,
    reporter: 'Riko (Petugas Perpus)',
    image:
      'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Kalkulator Saintifik Casio fx-991EX',
    category: 'Alat Kuliah',
    type: 'lost',
    status: 'Dalam Pencarian',
    statusColor: '#EF4444',
    date: 'Kemarin • 15:40 WIB',
    location: 'Gedung Kuliah Bersama (GKB) Ruang 402',
    faculty: 'Fakultas Teknik',
    description:
      'Kalkulator Casio warna hitam putih dengan stiker barcode jurusan di bagian tutup belakang. Sangat dibutuhkan untuk ujian minggu depan.',
    reward: 'Traktir Kopi / Makan Siang',
    reporter: 'Fajar Nugraha (Mhs Teknik Sipil)',
    image:
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Kunci Motor Honda Vario + Gantungan Lab',
    category: 'Kunci Kendaraan',
    type: 'found',
    status: 'Di Pos Keamanan Gerbang Utama',
    statusColor: '#10B981',
    date: '23 Sep • 08:30 WIB',
    location: 'Parkiran Sepeda Motor Gedung Dosen',
    faculty: 'Semua Fakultas',
    description:
      'Kunci remote keyless dengan gantungan akrilik bertuliskan "Lab Jaringan". Ditemukan tergantung di slot jok motor.',
    reward: null,
    reporter: 'Pak Joko (Satpam Kampus)',
    image:
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '4',
    title: 'Jaket Almamater & Binder Catatan',
    category: 'Pakaian & Buku',
    type: 'lost',
    status: 'Verifikasi Laporan',
    statusColor: '#F59E0B',
    date: '22 Sep • 17:00 WIB',
    location: 'Kantin Pusat / Gazebo Mahasiswa',
    faculty: 'Fakultas Ekonomi & Bisnis',
    description:
      'Jaket Almamater ukuran L, di dalamnya ada binder catatan mata kuliah Akuntansi Biaya serta flashdisk 32GB.',
    reward: 'Ada Imbalan',
    reporter: 'Dina Safitri (FEB 2024)',
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '5',
    title: 'Charger Laptop MacBook Type-C 67W',
    category: 'Elektronik',
    type: 'lost',
    status: 'Dalam Pencarian',
    statusColor: '#EF4444',
    date: '22 Sep • 13:10 WIB',
    location: 'Coworking Space / Student Center Lt. 1',
    faculty: 'Fakultas Ilmu Komunikasi',
    description:
      'Adaptor warna putih dengan kabel braided type-C. Ada stiker inisial "AR" warna perak di ujung adaptor.',
    reward: 'Ada Imbalan',
    reporter: 'Arya Raditya (Fikom 2023)',
    image:
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop',
  },
];

const CAMPUS_CATEGORIES = [
  'Semua',
  'KTM & Kartu',
  'Elektronik',
  'Alat Kuliah',
  'Kunci Kendaraan',
  'Pakaian & Buku',
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [filterType, setFilterType] = useState('all'); // 'all', 'lost', 'found'
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 'detail', 'reportLost', 'reportFound', 'status', 'verify'

  // Filter Data
  const filteredItems = INITIAL_CAMPUS_ITEMS.filter((item) => {
    const matchCategory =
      selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchType = filterType === 'all' || item.type === filterType;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchType && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#F8FAFC" />

      {/* Top Header & Kampus Branding */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="school" size={24} color="#2563EB" />
          </View>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandName}>
                Temu<Text style={styles.brandHighlight}>In</Text> Kampus
              </Text>
              <View style={styles.campusBadge}>
                <Text style={styles.campusBadgeText}>Civitas</Text>
              </View>
            </View>
            <Text style={styles.brandTagline}>Lost & Found Resmi Area Kampus</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.iconCircleButton}
          activeOpacity={0.7}
          onPress={() =>
            Alert.alert(
              'Posko Keamanan Kampus',
              'Hubungi Pos Satpam Pusat: Ext. 101 atau Gedung Rektorat Lt. 1'
            )
          }
        >
          <Ionicons name="shield-outline" size={20} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Menu 1: Search Informasi */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari KTM, nama fakultas, ruang kuliah, gedung..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Kategori Horizontal Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CAMPUS_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Hero Banner: Lingkup Kampus */}
        <View style={styles.heroBanner}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop',
            }}
            style={styles.heroBackground}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.urgentBadge}>
              <Ionicons name="megaphone" size={13} color="#FFFFFF" />
              <Text style={styles.urgentBadgeText}>POSKO RESMI KAMPUS</Text>
            </View>
            <Text style={styles.heroTitle}>Barang Tertinggal di Kelas atau Lab?</Text>
            <Text style={styles.heroSubtitle}>
              Platform lost & found terintegrasi dengan BEM, Pos Satpam, dan Perpustakaan untuk seluruh civitas akademika.
            </Text>
          </View>
        </View>

        {/* Menu 2 & 3: Lapor Kehilangan & Laporan Temuan */}
        <View style={styles.actionGridContainer}>
          <TouchableOpacity
            style={[styles.actionCard, styles.actionCardLost]}
            activeOpacity={0.85}
            onPress={() => setModalType('reportLost')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="alert-circle" size={26} color="#DC2626" />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Lapor Kehilangan</Text>
              <Text style={styles.actionDesc}>Laporkan barang kuliah yang hilang di area kampus</Text>
            </View>
            <View style={[styles.actionMiniButton, { backgroundColor: '#DC2626' }]}>
              <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.actionCardFound]}
            activeOpacity={0.85}
            onPress={() => setModalType('reportFound')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#DCFCE7' }]}>
              <MaterialCommunityIcons name="hand-heart" size={26} color="#16A34A" />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Laporan Temuan</Text>
              <Text style={styles.actionDesc}>Bantu teman sesama mahasiswa temukan barangnya</Text>
            </View>
            <View style={[styles.actionMiniButton, { backgroundColor: '#16A34A' }]}>
              <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Menu 6 & 7: Status Barang & Verifikasi Pengambilan */}
        <View style={styles.secondaryMenuRow}>
          <TouchableOpacity
            style={styles.secondaryMenuCard}
            activeOpacity={0.8}
            onPress={() => setModalType('status')}
          >
            <View style={[styles.secondaryIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="time" size={22} color="#2563EB" />
            </View>
            <View style={styles.secondaryTextWrap}>
              <Text style={styles.secondaryTitle}>Status Barang</Text>
              <Text style={styles.secondarySubtitle}>Pantau verifikasi satpam</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryMenuCard}
            activeOpacity={0.8}
            onPress={() => setModalType('verify')}
          >
            <View style={[styles.secondaryIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="card" size={22} color="#D97706" />
            </View>
            <View style={styles.secondaryTextWrap}>
              <Text style={styles.secondaryTitle}>Klaim Barang (KTM)</Text>
              <Text style={styles.secondarySubtitle}>Verifikasi identitas mhs</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Menu 4: Daftar Barang Hilang dan Ditemukan */}
        <View style={styles.listSectionHeader}>
          <View>
            <Text style={styles.listTitle}>Daftar Laporan Kampus</Text>
            <Text style={styles.listSubtitle}>Update barang hilang & temuan terkini</Text>
          </View>
          {/* Tab Filter Tipe */}
          <View style={styles.typeFilterToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, filterType === 'all' && styles.toggleBtnActive]}
              onPress={() => setFilterType('all')}
            >
              <Text style={[styles.toggleText, filterType === 'all' && styles.toggleTextActive]}>Semua</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, filterType === 'lost' && styles.toggleBtnActive]}
              onPress={() => setFilterType('lost')}
            >
              <Text style={[styles.toggleText, filterType === 'lost' && styles.toggleTextActive]}>Hilang</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, filterType === 'found' && styles.toggleBtnActive]}
              onPress={() => setFilterType('found')}
            >
              <Text style={[styles.toggleText, filterType === 'found' && styles.toggleTextActive]}>Temuan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List Card Barang */}
        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={44} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Tidak ada barang yang cocok</Text>
            <Text style={styles.emptyDesc}>Coba ganti kata kunci fakultas, gedung, atau nama barang.</Text>
          </View>
        ) : (
          filteredItems.map((item) => {
            const isLost = item.type === 'lost';
            return (
              <View key={item.id} style={styles.itemCard}>
                <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />

                <View style={styles.itemDetails}>
                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: isLost ? '#FEE2E2' : '#DCFCE7' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBadgeText,
                          { color: isLost ? '#DC2626' : '#16A34A' },
                        ]}
                      >
                        {isLost ? 'HILANG' : 'DITEMUKAN'}
                      </Text>
                    </View>
                    <Text style={[styles.statusText, { color: item.statusColor }]} numberOfLines={1}>
                      • {item.status}
                    </Text>
                  </View>

                  <Text style={styles.cardItemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <View style={styles.facultyBadgeRow}>
                    <Ionicons name="business-outline" size={12} color="#2563EB" />
                    <Text style={styles.facultyBadgeText}>{item.faculty}</Text>
                  </View>

                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={13} color="#64748B" />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>

                  <View style={styles.dateRow}>
                    <Ionicons name="time-outline" size={13} color="#94A3B8" />
                    <Text style={styles.dateText}>{item.date}</Text>
                  </View>

                  {/* Menu 5: Tombol Detail Barang */}
                  <View style={styles.cardFooter}>
                    {item.reward ? (
                      <View style={styles.rewardBadge}>
                        <Ionicons name="gift-outline" size={12} color="#D97706" />
                        <Text style={styles.rewardText} numberOfLines={1}>{item.reward}</Text>
                      </View>
                    ) : (
                      <View />
                    )}

                    <TouchableOpacity
                      style={styles.detailButton}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedItem(item);
                        setModalType('detail');
                      }}
                    >
                      <Text style={styles.detailButtonText}>Detail Barang</Text>
                      <Ionicons name="chevron-forward" size={14} color="#2563EB" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Footer Kampus */}
        <View style={styles.footerWrap}>
          <Text style={styles.footerNote}>
            🏫 Pos Satpam Pusat Siap Melayani 24 Jam • Hubungi Posko: Ext. 101
          </Text>
        </View>
      </ScrollView>

      {/* ================= MODAL: DETAIL BARANG (Menu 5) ================= */}
      <Modal
        visible={modalType === 'detail' && selectedItem !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderTitle}>Detail Barang Kampus</Text>
                  <TouchableOpacity onPress={() => setModalType(null)}>
                    <Ionicons name="close" size={24} color="#1E293B" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Image
                    source={{ uri: selectedItem.image }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />

                  <View style={styles.modalBody}>
                    <View style={styles.modalBadgeRow}>
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor:
                              selectedItem.type === 'lost' ? '#FEE2E2' : '#DCFCE7',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeBadgeText,
                            {
                              color:
                                selectedItem.type === 'lost' ? '#DC2626' : '#16A34A',
                            },
                          ]}
                        >
                          {selectedItem.type === 'lost'
                            ? 'BARANG HILANG'
                            : 'BARANG TEMUAN'}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.statusText,
                          { color: selectedItem.statusColor },
                        ]}
                      >
                        Status: {selectedItem.status}
                      </Text>
                    </View>

                    <Text style={styles.modalItemTitle}>{selectedItem.title}</Text>
                    <Text style={styles.modalCategoryText}>
                      Kategori: {selectedItem.category} • Lingkup: {selectedItem.faculty}
                    </Text>

                    <View style={styles.modalInfoBox}>
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="location" size={16} color="#DC2626" />
                        <Text style={styles.modalInfoValue}>
                          {selectedItem.location}
                        </Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="calendar" size={16} color="#2563EB" />
                        <Text style={styles.modalInfoValue}>
                          {selectedItem.date}
                        </Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="person" size={16} color="#059669" />
                        <Text style={styles.modalInfoValue}>
                          Pelapor: {selectedItem.reporter}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.modalSectionLabel}>Deskripsi & Ciri Khusus:</Text>
                    <Text style={styles.modalDesc}>{selectedItem.description}</Text>

                    {/* Tombol Aksi Verifikasi Pengambilan */}
                    <TouchableOpacity
                      style={styles.claimButton}
                      activeOpacity={0.8}
                      onPress={() => setModalType('verify')}
                    >
                      <Ionicons
                        name="card"
                        size={18}
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.claimButtonText}>
                        Klaim Barang Ini (Tunjukkan KTM)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: STATUS BARANG (Menu 6) ================= */}
      <Modal
        visible={modalType === 'status'}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.iconHeadingRow}>
                <Ionicons name="time" size={22} color="#2563EB" />
                <Text style={styles.modalHeaderTitle}>Lacak Status Barang Kampus</Text>
              </View>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalExplain}>
              Laporan Anda disinkronkan secara real-time dengan Pos Satpam, Tata Usaha Fakultas, dan Perpustakaan Kampus.
            </Text>

            <View style={styles.statusTimeline}>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotDone]}>
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                </View>
                <View style={styles.timelineTexts}>
                  <Text style={styles.timelineTitle}>Laporan Masuk di Sistem Kampus</Text>
                  <Text style={styles.timelineTime}>Otomatis broadcast ke grup civitas</Text>
                </View>
              </View>

              <View style={styles.timelineLine} />

              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotDone]}>
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                </View>
                <View style={styles.timelineTexts}>
                  <Text style={styles.timelineTitle}>Verifikasi Oleh Petugas Keamanan</Text>
                  <Text style={styles.timelineTime}>Pengecekan fisik di Pos Satpam / TU</Text>
                </View>
              </View>

              <View style={styles.timelineLine} />

              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotActive]}>
                  <Ionicons name="search" size={12} color="#FFF" />
                </View>
                <View style={styles.timelineTexts}>
                  <Text style={styles.timelineTitle}>Pencocokan Data Mahasiswa / Pemilik</Text>
                  <Text style={styles.timelineTime}>Siap diambil dengan menunjukkan KTM</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeFullBtn}
              onPress={() => setModalType(null)}
            >
              <Text style={styles.closeFullBtnText}>Tutup Pelacak</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: VERIFIKASI PENGAMBILAN (Menu 7) ================= */}
      <Modal
        visible={modalType === 'verify'}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.iconHeadingRow}>
                <Ionicons name="shield-checkmark" size={22} color="#059669" />
                <Text style={styles.modalHeaderTitle}>Verifikasi Pengambilan Kampus</Text>
              </View>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalExplain}>
              Demi keamanan bersama, serah terima barang di lingkungan universitas wajib mengikuti aturan berikut:
            </Text>

            <View style={styles.verifyStepBox}>
              <Text style={styles.stepNum}>1. Wajib Tunjukkan KTM Aktif</Text>
              <Text style={styles.stepDesc}>
                Tunjukkan Kartu Tanda Mahasiswa (KTM) atau Kartu Pegawai aktif, atau dashboard SIAKAD kampus Anda.
              </Text>
            </View>

            <View style={styles.verifyStepBox}>
              <Text style={styles.stepNum}>2. Sebutkan Ciri Khusus</Text>
              <Text style={styles.stepDesc}>
                Sebutkan isi detail tas/dompet, wallpaper HP, nomor seri, atau goresan khas yang tidak diumumkan publik.
              </Text>
            </View>

            <View style={styles.verifyStepBox}>
              <Text style={styles.stepNum}>3. Ambil di Pos Satpam / Ruang TU</Text>
              <Text style={styles.stepDesc}>
                Hindari janji temu di tempat sepi. Pengambilan resmi hanya dilakukan di Pos Satpam atau Kantor Tata Usaha.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.closeFullBtn, { backgroundColor: '#059669' }]}
              onPress={() => {
                Alert.alert(
                  'Klaim Tercatat',
                  'Permohonan klaim telah dikirim ke Pos Satpam. Silakan datangi Pos Keamanan Kampus dengan membawa KTM aktif.',
                  [{ text: 'Siap, Mengerti', onPress: () => setModalType(null) }]
                );
              }}
            >
              <Text style={styles.closeFullBtnText}>Saya Mengerti & Datangi Posko</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: FORM LAPOR KEHILANGAN (Menu 2) ================= */}
      <Modal
        visible={modalType === 'reportLost'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.iconHeadingRow}>
                <Ionicons name="alert-circle" size={22} color="#DC2626" />
                <Text style={styles.modalHeaderTitle}>Lapor Kehilangan di Kampus</Text>
              </View>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalExplain}>
              Laporan Anda akan langsung diteruskan ke Pos Satpam dan komunitas mahasiswa fakultas.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nama Barang (contoh: Binder Akuntansi & Jaket Almet)"
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Lokasi Hilang (contoh: Ruang 304 Gedung Fasilkom)"
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="NIM / Jurusan Anda (contoh: 2210511099 - TI)"
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={[styles.modalInput, { height: 75 }]}
              placeholder="Ciri-ciri khusus, warna, stiker, isi barang..."
              placeholderTextColor="#94A3B8"
              multiline
            />
            <TouchableOpacity
              style={[styles.closeFullBtn, { backgroundColor: '#DC2626' }]}
              onPress={() => {
                Alert.alert(
                  'Laporan Terkirim',
                  'Laporan kehilangan berhasil dipublikasikan di feed TemuIn Kampus!',
                  [{ text: 'OK', onPress: () => setModalType(null) }]
                );
              }}
            >
              <Text style={styles.closeFullBtnText}>Kirim Laporan Kehilangan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: FORM LAPOR TEMUAN (Menu 3) ================= */}
      <Modal
        visible={modalType === 'reportFound'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.iconHeadingRow}>
                <MaterialCommunityIcons name="hand-heart" size={22} color="#16A34A" />
                <Text style={styles.modalHeaderTitle}>Laporan Barang Temuan Kampus</Text>
              </View>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalExplain}>
              Terima kasih atas kebaikan Anda! Laporkan barang yang Anda temukan di lingkungan kampus.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nama Barang yang Ditemukan (contoh: KTM Budi)"
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Lokasi Ditemukan (contoh: Kantin FT / Lab Komputer)"
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Barang saat ini dititipkan di mana? (misal: Pos Satpam)"
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity
              style={[styles.closeFullBtn, { backgroundColor: '#16A34A' }]}
              onPress={() => {
                Alert.alert(
                  'Terima Kasih',
                  'Laporan temuan berhasil diunggah. Teman mahasiswa sangat terbantu!',
                  [{ text: 'OK', onPress: () => setModalType(null) }]
                );
              }}
            >
              <Text style={styles.closeFullBtnText}>Kirim Laporan Temuan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
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
    letterSpacing: -0.5,
  },
  brandHighlight: {
    color: '#2563EB',
  },
  campusBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  campusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  brandTagline: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  iconCircleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  searchSection: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
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
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
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
  heroBanner: {
    height: 145,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
  },
  heroContent: {
    zIndex: 1,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  urgentBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 11,
    color: '#E2E8F0',
    lineHeight: 16,
  },
  actionGridContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 130,
  },
  actionCardLost: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  actionCardFound: {
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTextWrap: {
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  actionMiniButton: {
    alignSelf: 'flex-end',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryMenuRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  secondaryMenuCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  secondaryTextWrap: {
    flex: 1,
  },
  secondaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  secondarySubtitle: {
    fontSize: 10,
    color: '#64748B',
  },
  listSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  listSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  typeFilterToggle: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  itemImage: {
    width: 90,
    height: 110,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
  },
  cardItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  facultyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  facultyBadgeText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 3,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 10,
    color: '#94A3B8',
    marginLeft: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: '50%',
  },
  rewardText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 3,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    marginRight: 2,
  },
  footerWrap: {
    marginTop: 10,
    alignItems: 'center',
  },
  footerNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  smallModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  iconHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalExplain: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  modalImage: {
    width: '100%',
    height: 190,
    borderRadius: 16,
    marginBottom: 14,
    backgroundColor: '#E2E8F0',
  },
  modalBody: {
    paddingBottom: 20,
  },
  modalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalItemTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  modalCategoryText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  modalInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalInfoValue: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 18,
  },
  claimButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statusTimeline: {
    marginVertical: 8,
    paddingLeft: 6,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDotDone: {
    backgroundColor: '#10B981',
  },
  timelineDotActive: {
    backgroundColor: '#2563EB',
  },
  timelineLine: {
    width: 2,
    height: 22,
    backgroundColor: '#CBD5E1',
    marginLeft: 10,
    marginVertical: 2,
  },
  timelineTexts: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  timelineTime: {
    fontSize: 11,
    color: '#64748B',
  },
  verifyStepBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  closeFullBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  closeFullBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});