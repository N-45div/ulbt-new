// Pages/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIOYnjPhtf-GNZjie-nwyZSaxwbW9IlYo",
  authDomain: "lawyal-tech.firebaseapp.com",
  projectId: "lawyal-tech",
  storageBucket: "lawyal-tech.firebasestorage.app",
  messagingSenderId: "685175108573",
  appId: "1:685175108573:web:4d2ad3c71fbe8e7fdabc34",
  measurementId: "G-2XD64VL4X7",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
