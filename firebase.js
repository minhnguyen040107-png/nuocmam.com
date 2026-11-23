
import { initializeApp } from
"https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

// Thay bằng cấu hình thật của Firebase

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmMD5lApByM4HYP4cTV_cA6W0t0fu21Xw",
  authDomain: "nuoc-mam-hang-nga.firebaseapp.com",
  projectId: "nuoc-mam-hang-nga",
  storageBucket: "nuoc-mam-hang-nga.firebasestorage.app",
  messagingSenderId: "1008932506539",
  appId: "1:1008932506539:web:37abb8afd3db1e8f2be0ee",
  measurementId: "G-CR3Z36YM9L"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
