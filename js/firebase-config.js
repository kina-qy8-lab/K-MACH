// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCGIKgIuSlee2SxUlNsatUH1l7C2BkH3hc",
  authDomain: "k-mach.firebaseapp.com",
  projectId: "k-mach",
  storageBucket: "k-mach.firebasestorage.app",
  messagingSenderId: "735279357382",
  appId: "1:735279357382:web:8dcecd5d5f01c7337826c7"
};

// Initialize Firebase (Compat)
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// グローバルに公開
window.auth = auth;
window.db = db;
// Firestoreの便利関数へのショートカットも必要ならここで定義
