// Configuración Firebase para notificaciones push MARÉ
// Integración completa con Firebase Messaging

// Firebase CDN imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js';

const firebaseConfig = {
  apiKey: "AIzaSyAKQnyX92kFwm5R3XCJHSldB7I1nATI4i8",
  authDomain: "mare-notifications.firebaseapp.com",
  projectId: "mare-notifications",
  storageBucket: "mare-notifications.firebasestorage.app",
  messagingSenderId: "247760169079",
  appId: "1:247760169079:web:f434638500d4cc84093e72",
  measurementId: "G-J3BZH45FHM"
};

// VAPID Key para push notifications
const vapidKey = "BBKXwLsVytTSPwEoVmfH0CzZTsxZvHGT_uEexRTi5Obppt11TxmqtRdMQme65TTva1G6PujZHutpKtd2vu-7PPU";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { firebaseConfig, vapidKey, app, messaging, analytics };