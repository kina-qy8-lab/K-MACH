import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, writeBatch } from "firebase/firestore";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCGIKgIuSlee2SxUlNsatUH1l7C2BkH3hc",
  authDomain: "k-mach.firebaseapp.com",
  projectId: "k-mach",
  storageBucket: "k-mach.firebasestorage.app",
  messagingSenderId: "735279357382",
  appId: "1:735279357382:web:8dcecd5d5f01c7337826c7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// グローバル変数に登録して他のファイルから使えるようにする
window.auth = auth;
window.db = db;
window.firebaseAuth = { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged };
window.firebaseFirestore = { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, writeBatch };
