// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBIT-AwbJlN5Jv21smZ7MdY_a5OHWl1AhI",
  authDomain: "authentication-4a424.firebaseapp.com",
  projectId: "authentication-4a424",
  storageBucket: "authentication-4a424.appspot.com",
  messagingSenderId: "962176427076",
  appId: "1:962176427076:web:9033a12b14660b14b48811",
  measurementId: "G-WZ1C6CFJT6",
};

// Initialize app
const app = initializeApp(firebaseConfig);

// Services
const auth = getAuth(app);
const db = getFirestore(app);

// Auth
const googleProvider = new GoogleAuthProvider();
const usersCollection = collection(db, "Users");

export {
  app,
  auth,
  db,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
  googleProvider,
  usersCollection,
};
