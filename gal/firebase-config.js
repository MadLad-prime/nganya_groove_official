const firebaseConfig = {
  apiKey: "AIzaSyDxQztup6TxUE93f5YqWDwOddcyIbIT-Hs",
  authDomain: "nuno-34208.firebaseapp.com",
  projectId: "nuno-34208",
  storageBucket: "nuno-34208.firebasestorage.app",
  messagingSenderId: "122071208643",
  appId: "1:122071208643:web:22fd2d143a51a97580c876",
  measurementId: "G-KHKVR7T62F"
};

let app;
let db;

try {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase initialized successfully.");
} catch (e) {
    console.error("Error initializing Firebase:", e);
    alert("Firebase could not be initialized. Please check your configuration and ensure SDKs are loaded.");
}