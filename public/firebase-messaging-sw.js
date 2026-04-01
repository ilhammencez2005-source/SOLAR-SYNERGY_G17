importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBNUu9a_37AjosbPp-jKprOELjISyiqD_w",
  authDomain: "gen-lang-client-0567679304.firebaseapp.com",
  projectId: "gen-lang-client-0567679304",
  storageBucket: "gen-lang-client-0567679304.firebasestorage.app",
  messagingSenderId: "286007636005",
  appId: "1:286007636005:web:ac8963ea150c59f8b28fcc"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
