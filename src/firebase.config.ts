import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyAMYl3rzZiBMSct8sB8s1MughuDOyr6Ve8",
  authDomain: "myfitnesscenter-fcc15.firebaseapp.com",
  projectId: "myfitnesscenter-fcc15",
  storageBucket: "myfitnesscenter-fcc15.appspot.com",
  messagingSenderId: "653770211550",
  appId: "1:653770211550:web:d26172675e293e51bf824f",
  measurementId: "G-RVHB2S4Q67"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);