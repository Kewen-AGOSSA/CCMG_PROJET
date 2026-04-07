/**
 * CONFIGURATION FIREBASE - CCMG Évangélisation
 * Initialise la connexion à la base de données Firebase Firestore.
 * Ce fichier doit être chargé AVANT script.js
 */

// Clés de connexion uniques au projet CCMG-Evangelisation
const firebaseConfig = {
    apiKey: "AIzaSyBelL96HH26Xv9yLLwlfGnZ9eaKyoLFfk0",
    authDomain: "ccmg-evangelisation.firebaseapp.com",
    projectId: "ccmg-evangelisation",
    storageBucket: "ccmg-evangelisation.firebasestorage.app",
    messagingSenderId: "89211723310",
    appId: "1:89211723310:web:24b041abbd75666dccc9bf"
};

// Initialisation de Firebase
firebase.initializeApp(firebaseConfig);

// Référence à la base de données Firestore (variable globale utilisée dans script.js)
const db = firebase.firestore();

console.log('[CCMG] Firebase connecté avec succès ✓');
