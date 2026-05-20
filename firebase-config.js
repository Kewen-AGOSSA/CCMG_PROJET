/**
 * CONFIGURATION FIREBASE - UDAMG Évangélisation
 * Initialise la connexion à la base de données Firebase Firestore.
 * Ce fichier doit être chargé AVANT script.js
 */

// Clés de connexion uniques au projet UDAMG-Evangelisation
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

// Activation du cache hors-ligne (Offline Persistence) pour économiser le quota Firebase
db.enablePersistence()
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          console.warn('[UDAMG] Cache Firebase désactivé : plusieurs onglets ouverts.');
      } else if (err.code == 'unimplemented') {
          console.warn('[UDAMG] Cache Firebase non supporté par ce navigateur.');
      }
  });

console.log('[UDAMG] Firebase connecté avec succès ✓');
