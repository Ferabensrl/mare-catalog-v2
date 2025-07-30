// Sistema de notificaciones push para MARÉ Catálogo
// ARCHIVO NUEVO - NO AFECTA FUNCIONAMIENTO EXISTENTE

import { firebaseConfig, vapidKey } from './firebase-config.js';

class MareNotifications {
  constructor() {
    this.isSupported = false;
    this.isSubscribed = false;
    this.subscription = null;
    this.init();
  }

  async init() {
    // Verificar soporte para notificaciones
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      this.isSupported = true;
      console.log('🔔 Notificaciones push soportadas');
      
      // Registrar service worker si no está registrado
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registrado para notificaciones');
        
        // Verificar si ya está suscrito
        this.subscription = await registration.pushManager.getSubscription();
        this.isSubscribed = !!this.subscription;
        
      } catch (error) {
        console.error('❌ Error registrando Service Worker:', error);
      }
    } else {
      console.warn('⚠️ Notificaciones push no soportadas en este navegador');
    }
  }

  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Notificaciones no soportadas');
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Permisos de notificación concedidos');
      return true;
    } else {
      console.warn('❌ Permisos de notificación denegados');
      return false;
    }
  }

  async subscribe() {
    if (!this.isSupported) {
      throw new Error('Notificaciones no soportadas');
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        throw new Error('Service Worker no registrado');
      }

      // Suscribirse a push notifications
      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
      });

      this.isSubscribed = true;
      console.log('✅ Suscrito a notificaciones push');
      
      // Enviar suscripción al servidor (opcional)
      await this.sendSubscriptionToServer(this.subscription);
      
      return this.subscription;
      
    } catch (error) {
      console.error('❌ Error suscribiéndose a notificaciones:', error);
      throw error;
    }
  }

  async unsubscribe() {
    if (this.subscription) {
      try {
        await this.subscription.unsubscribe();
        this.isSubscribed = false;
        this.subscription = null;
        console.log('✅ Desuscrito de notificaciones push');
      } catch (error) {
        console.error('❌ Error desuscribiéndose:', error);
      }
    }
  }

  async sendSubscriptionToServer(subscription) {
    // Aquí podrías enviar la suscripción a tu servidor
    // Por ahora solo la guardamos en localStorage para testing
    localStorage.setItem('mare-push-subscription', JSON.stringify(subscription));
    console.log('💾 Suscripción guardada localmente');
  }

  // Mostrar notificación local (para testing)
  showLocalNotification(title, options = {}) {
    if (!this.isSupported) {
      alert(`${title}\n${options.body || ''}`);
      return;
    }

    const defaultOptions = {
      body: options.body || 'Nueva actualización disponible',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      image: options.image,
      data: options.data || {},
      // actions removidas para compatibilidad local
    };

    new Notification(title, { ...defaultOptions, ...options });
  }

  // Convertir VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Métodos útiles para UI
  getStatus() {
    return {
      isSupported: this.isSupported,
      isSubscribed: this.isSubscribed,
      permission: Notification.permission
    };
  }
}

// Crear instancia global
window.mareNotifications = new MareNotifications();

export default MareNotifications;