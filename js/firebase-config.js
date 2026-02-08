// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCGIKgIuSlee2SxUlNsatUH1l7C2BkH3hc",
  authDomain: "k-mach.firebaseapp.com",
  projectId: "k-mach",
  storageBucket: "k-mach.firebasestorage.app",
  messagingSenderId: "735279357382",
  appId: "1:735279357382:web:8dcecd5d5f01c7337826c7"
};

// Initialize Firebase (Compat版なので firebase.initializeApp が使えます)
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// グローバル変数に登録
window.auth = auth;
window.db = db;

// 認証・DB操作用の関数をショートカットとして登録（App.jsなどで使うため）
window.firebaseAuth = { 
  signInWithPopup: (auth, provider) => auth.signInWithPopup(provider),
  GoogleAuthProvider: firebase.auth.GoogleAuthProvider,
  signOut: (auth) => auth.signOut(),
  onAuthStateChanged: (auth, cb) => auth.onAuthStateChanged(cb)
};

// Firestoreはチェーンメソッドなので、batchなどのユーティリティのみラップ
window.firebaseFirestore = {
  // collection/docなどはインスタンスメソッドなのでそのまま使う
  // バッチ処理用
  writeBatch: (db) => db.batch() 
};
