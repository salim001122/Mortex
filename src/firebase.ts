import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your custom njk-exchange Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBm82z4pEmEerJBBRw2_B45AmWRLJRUn0",
  authDomain: "njk-exchange.firebaseapp.com",
  projectId: "njk-exchange",
  storageBucket: "njk-exchange.firebasestorage.app",
  messagingSenderId: "322844344895",
  appId: "1:322844344895:web:47435325a4c13ecd99ee8a",
  measurementId: "G-XVL46K5YP2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
