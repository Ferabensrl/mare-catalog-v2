// Firebase Service Worker para notificaciones push
// OBLIGATORIO para Firebase Cloud Messaging

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKQnyX92kFwm5R3XCJHSldB7I1nATI4i8",
  authDomain: "mare-notifications.firebaseapp.com",
  projectId: "mare-notifications",
  storageBucket: "mare-notifications.firebasestorage.app",
  messagingSenderId: "247760169079",
  appId: "1:247760169079:web:f434638500d4cc84093e72",
  measurementId: "G-J3BZH45FHM"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 Background message received:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'Ver catálogo'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();
  
  // Open app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes('catalogo.mareuy.com') && 'focus' in client) {
            return client.focus();
          }
        }
        // If app is not open, open it
        if (clients.openWindow) {
          return clients.openWindow('https://catalogo.mareuy.com/');
        }
      })
  );
});

console.log('🔔 Firebase Messaging Service Worker loaded');