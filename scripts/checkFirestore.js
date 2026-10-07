const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function checkAll() {
  console.log('=== CHECKING FIRESTORE COLLECTIONS ===');
  
  const adminsSnap = await getDocs(collection(db, 'admins'));
  console.log(`\n[admins] count: ${adminsSnap.docs.length}`);
  adminsSnap.docs.forEach(doc => {
    console.log(` - ID: ${doc.id} | Email: ${doc.data().email} | Name: ${doc.data().name}`);
  });

  const itemsSnap = await getDocs(collection(db, 'items'));
  console.log(`\n[items] count: ${itemsSnap.docs.length}`);
  itemsSnap.docs.forEach(doc => {
    console.log(` - ID: ${doc.id} | Title: ${doc.data().title} | Type: ${doc.data().type} | Reporter: ${doc.data().reporter}`);
  });

  const claimsSnap = await getDocs(collection(db, 'claims'));
  console.log(`\n[claims] count: ${claimsSnap.docs.length}`);
  claimsSnap.docs.forEach(doc => {
    console.log(` - ID: ${doc.id} | ItemTitle: ${doc.data().itemTitle} | Student: ${doc.data().studentName}`);
  });

  process.exit(0);
}

checkAll().catch(console.error);
