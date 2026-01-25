// Importer Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCm4fLh4EF55sjD9npfOAOwGgPimXEBoL8",
  authDomain: "gestion-dossiers-14937.firebaseapp.com",
  projectId: "gestion-dossiers-14937",
  storageBucket: "gestion-dossiers-14937.firebasestorage.app",
  messagingSenderId: "478840325568",
  appId: "1:478840325568:web:1360f0f17e96d22ccab425",
  measurementId: "G-GZNP1RNTHY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
