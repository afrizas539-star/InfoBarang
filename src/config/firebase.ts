import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCqwbJlyMPmEI6wr_nKFVZm6OvJH4blEIY",
    authDomain: "temuin-2808e.firebaseapp.com",
    projectId: "temuin-2808e",
    storageBucket: "temuin-2808e.firebasestorage.app",
    messagingSenderId: "510115226009",
    appId: "1:510115226009:web:3cba590fe6673a3b6f3308",
    measurementId: "G-YZ569K32KQ"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Export layanan yang akan dipakai di aplikasi
export const auth = getAuth(app);
export const db = getFirestore(app);