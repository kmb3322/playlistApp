// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBoKw6GtwnIPX6caXeKAVwZYyuRg5F_4qY",
  authDomain: "theultimateplaylist-afba2.firebaseapp.com",
  projectId: "theultimateplaylist-afba2",
  storageBucket: "theultimateplaylist-afba2.firebasestorage.app",
  messagingSenderId: "123749963434",
  appId: "1:123749963434:web:fc6c9adb0341c576fa22d3",
  measurementId: "G-DTM9MJEFLH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };