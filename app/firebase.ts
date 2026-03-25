// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2Yo66g9syvaIO6E5L_EU1NOJiZ9V1j4M",
  authDomain: "web-app-project-44898.firebaseapp.com",
  projectId: "web-app-project-44898",
  storageBucket: "web-app-project-44898.firebasestorage.app",
  messagingSenderId: "1069178203526",
  appId: "1:1069178203526:web:80a9576332bdbada241007"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);