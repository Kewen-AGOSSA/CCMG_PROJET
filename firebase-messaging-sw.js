importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyBelL96HH26Xv9yLLwlfGnZ9eaKyoLFfk0",
    authDomain: "ccmg-evangelisation.firebaseapp.com",
    projectId: "ccmg-evangelisation",
    storageBucket: "ccmg-evangelisation.firebasestorage.app",
    messagingSenderId: "89211723310",
    appId: "1:89211723310:web:24b041abbd75666dccc9bf"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo_ccmg.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
