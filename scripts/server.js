/**
 * InfoBarang / TemuIn - Shared Campus Database Backend Server
 * 
 * Server backend mandiri berbasis Node.js standar (tanpa dependensi eksternal).
 * Menyediakan sinkronisasi data antar user (Mahasiswa A, Mahasiswa B, Admin)
 * melalui REST API & database file JSON bersama.
 * 
 * Cara menjalankan:
 * node ./scripts/server.js
 * atau
 * npm run backend
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'shared_campus_db.json');

// Default initial data jika file database belum ada
function getInitialDb() {
  return {
    items: [
      {
        id: '1',
        title: 'KTM & Lanyard a.n Nabila Putri',
        category: 'KTM & Kartu',
        type: 'found',
        status: 'TERSEDIA',
        foundStatus: 'TERSEDIA',
        statusColor: '#15803D',
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
        status: 'DALAM PENCARIAN',
        lostStatus: 'DALAM PENCARIAN',
        verificationStatus: 'Disetujui',
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
        status: 'TERSEDIA',
        foundStatus: 'TERSEDIA',
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
        status: 'DALAM PENCARIAN',
        lostStatus: 'DALAM PENCARIAN',
        verificationStatus: 'Disetujui',
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
    ],
    claims: [
      {
        id: 'claim-1',
        itemId: '1',
        itemTitle: 'KTM & Lanyard a.n Nabila Putri',
        itemCategory: 'KTM & Kartu',
        itemImage:
          'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?q=80&w=600&auto=format&fit=crop',
        studentName: 'Nabila Putri',
        studentNim: '2210511045',
        studentFaculty: 'Fakultas Ilmu Komputer',
        studentPhone: '081234567890',
        proofDetails: 'KTM atas nama saya, gantungan lanyard warna navy.',
        idCardImage:
          'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?q=80&w=600&auto=format&fit=crop',
        status: 'Menunggu Verifikasi',
        createdAt: 'Hari ini • 11:00 WIB',
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[Backend] Gagal membaca DB_FILE:', err);
  }
  const initDb = getInitialDb();
  saveDatabase(initDb);
  return initDb;
}

function saveDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Backend] Gagal menyimpan DB_FILE:', err);
  }
}

// Inisialisasi database
let db = loadDatabase();

const server = http.createServer((req, res) => {
  // CORS Headers agar mobile app & browser web dapat mengakses API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Endpoint 1: Health check
  if (url.pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'InfoBarang Shared Database',
        serverTime: new Date().toISOString(),
        itemsCount: db.items.length,
        claimsCount: db.claims.length,
      })
    );
    return;
  }

  // Endpoint 2: GET Data bersama
  if (url.pathname === '/api/data' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db));
    return;
  }

  // Endpoint 3: POST Sync Data dari klien (Mahasiswa / Admin)
  if (url.pathname === '/api/sync' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (payload.items) {
          db.items = payload.items;
        }
        if (payload.claims) {
          db.claims = payload.claims;
        }
        db.updatedAt = new Date().toISOString();
        saveDatabase(db);

        console.log(`[Backend Sync] Sukses sinkronisasi data! Items: ${db.items.length}, Claims: ${db.claims.length}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, updatedAt: db.updatedAt }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint tidak ditemukan' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`📡 InfoBarang Shared Database Server berjalan!`);
  console.log(`🌐 Local:   http://localhost:${PORT}`);
  console.log(`📱 Android: http://10.0.2.2:${PORT}`);
  console.log(`📁 DB File: ${DB_FILE}`);
  console.log(`====================================================`);
});
