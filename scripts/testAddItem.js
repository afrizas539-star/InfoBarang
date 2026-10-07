const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyCqwbJlyMPmEI6wr_nKFVZm6OvJH4blEIY",
    authDomain: "temuin-2808e.firebaseapp.com",
    projectId: "temuin-2808e",
    storageBucket: "temuin-2808e.firebasestorage.app",
    messagingSenderId: "510115226009",
    appId: "1:510115226009:web:3cba590fe6673a3b6f3308",
    measurementId: "G-YZ569K32KQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testAdd() {
  console.log('Testing adding item to items collection...');
  try {
    const docRef = await addDoc(collection(db, 'items'), {
      title: 'Kunci Motor Honda Vario (Test)',
      category: 'Kunci & Aksesori',
      type: 'found',
      status: 'TERSEDIA',
      statusColor: '#15803D',
      date: 'Hari ini',
      location: 'Gedung Perpustakaan Lt. 2',
      faculty: 'Semua Fakultas',
      description: 'Ditemukan kunci motor Honda dengan gantungan hitam.',
      reporter: 'Budi Santoso, S.Sos',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date().toISOString()
    });
    console.log('Successfully added test item with ID:', docRef.id);
  } catch (e) {
    console.error('Error adding item:', e);
  }

  try {
    const snapshot = await getDocs(collection(db, 'items'));
    console.log('Items collection document count:', snapshot.docs.length);
    snapshot.docs.forEach(doc => console.log('Doc ID:', doc.id, 'Data:', doc.data().title));
  } catch (e) {
    console.error('Error getting items:', e);
  }

  process.exit(0);
}

testAdd();
