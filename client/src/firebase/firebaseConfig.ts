import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBTw8lfu3RFVdXH49ZCQdUDjZBcc2zI-2E",
  authDomain: "college-placement-portal-2388d.firebaseapp.com",
  projectId: "college-placement-portal-2388d",
  storageBucket: "college-placement-portal-2388d.firebasestorage.app",
  messagingSenderId: "361991175952",
  appId: "1:361991175952:web:1e1e0924f20e9b125faf95",
  databaseUrl: "https://college-placement-portal-2388d-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const database = getDatabase(app);