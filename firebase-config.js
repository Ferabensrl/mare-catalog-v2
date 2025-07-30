// Configuración Firebase para notificaciones push MARÉ
// ARCHIVO NUEVO - NO AFECTA FUNCIONAMIENTO EXISTENTE

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

export { firebaseConfig, vapidKey };