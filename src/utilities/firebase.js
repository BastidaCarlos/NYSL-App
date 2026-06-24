import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const firebase = initializeApp(firebaseConfig);

const auth = getAuth(firebase);
const provider = new GoogleAuthProvider();
const db = getFirestore(firebase);

export const signInWithGoogle = () => {
    signInWithPopup(auth, provider);
};

export const signInWithEmail = (email, password) => {
    signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password);
};

const firebaseSignOut = () => signOut(auth);

export { firebaseSignOut as signOut, auth, db };