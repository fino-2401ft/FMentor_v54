// config/Firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA7K6tZMxKEu6Nv920r4mltkqP69sHRJGU",
  authDomain: "fmentor-235af.firebaseapp.com",
  databaseURL: "https://fmentor-235af-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fmentor-235af",
  storageBucket: "fmentor-235af.appspot.com",
  messagingSenderId: "682757072782",
  appId: "1:682757072782:web:f8bdedc40ebb9b4bc726df",
};

const app = initializeApp(firebaseConfig);

export const realtimeDB = getDatabase(app);
export const auth = getAuth(app);