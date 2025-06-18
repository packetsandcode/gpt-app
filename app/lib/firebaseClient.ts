import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCrYQ57QhdFf0WefHMn0Fuz4f3xWxh3bH0",
    authDomain: "chatgptapp-f3eac.firebaseapp.com",
    projectId: "chatgptapp-f3eac",
    storageBucket: "chatgptapp-f3eac.firebasestorage.app",
    messagingSenderId: "629408539540",
    appId: "1:629408539540:web:a77f420478a22dabb0a581",
    measurementId: "G-66990FX4DQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);