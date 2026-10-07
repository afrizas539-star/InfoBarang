const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, addDoc } = require('firebase/firestore');

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

const ADMINS_COLLECTION = 'admins';

const DEFAULT_ADMIN = {
  name: 'Budi Santoso, S.Sos',
  email: 'admin.kampus@gmail.com',
  password: 'admin123kampus',
  phone: '081298765432',
  avatarUri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  role: 'Petugas Pengelola Lost & Found Kampus',
  officeLocation: 'Posko Keamanan Pusat (Gedung Rektorat Lt. 1)',
};

async function seedAdmin() {
  console.log('Checking existing admin data in Firestore...');
  const q = query(
    collection(db, ADMINS_COLLECTION),
    where('email', '==', DEFAULT_ADMIN.email)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    console.log('Admin already exists in Firestore:');
    snapshot.docs.forEach(doc => console.log(doc.id, doc.data()));
  } else {
    console.log('Admin not found in Firestore. Pushing new admin account data...');
    const docRef = await addDoc(collection(db, ADMINS_COLLECTION), {
      ...DEFAULT_ADMIN,
      createdAt: new Date().toISOString()
    });
    console.log('Successfully created admin account in Firestore with ID:', docRef.id);
  }
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Error seeding admin data:', err);
  process.exit(1);
});
