// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8LzAQXIGWs96LoxgiS3rtudrht9ArGdM",
  authDomain: "aksaragajang.firebaseapp.com",
  projectId: "aksaragajang",
  storageBucket: "aksaragajang.firebasestorage.app",
  messagingSenderId: "94329147998",
  appId: "1:94329147998:web:ff9b95cb0b02a51c321acf"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// export const db = getFirestore(app);

export default app;