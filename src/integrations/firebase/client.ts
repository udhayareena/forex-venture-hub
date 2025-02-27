
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKwfAcEYXbxtvAUU80CIbYGq-LtIUPAWA",
  authDomain: "forex-dadef.firebaseapp.com",
  databaseURL: "https://forex-dadef-default-rtdb.firebaseio.com",
  projectId: "forex-dadef",
  storageBucket: "forex-dadef.appspot.com",
  messagingSenderId: "962963461145",
  appId: "1:962963461145:web:583c96fa6a82d2d00c8688",
  measurementId: "G-QC4TT37NYY"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAnalytics = typeof window !== 'undefined' ? getAnalytics(firebaseApp) : null;
export const firebaseDb = getDatabase(firebaseApp);
