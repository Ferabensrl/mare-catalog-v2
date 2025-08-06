// sw.js - Service Worker para MARÉ Catálogo PWA
// Versión del cache - incrementar cuando haya cambios importantes
const CACHE_VERSION = 'mare-v1.2.0-whatsapp-fix';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGES_CACHE = `${CACHE_VERSION}-images`;

// Archivos críticos que siempre deben estar en caché
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/productos.json',
  '/mensaje.json',
  '/icon-192.png',
  '/icon-512.png',
  '/logo-mare.png'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Instalando Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 SW: Cacheando archivos estáticos...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ SW: Archivos estáticos cacheados exitosamente');
        // Tomar control inmediatamente
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ SW: Error cacheando archivos estáticos:', error);
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 SW: Activando Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    // Limpiar caches antiguos
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGES_CACHE) {
              console.log('🗑️ SW: Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ SW: Service Worker activado y caches limpiados');
        // Tomar control de todas las pestañas abiertas
        return self.clients.claim();
      })
  );
});

// Interceptar requests (fetch)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo interceptar requests del mismo origen
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    handleRequest(request)
  );
});

// Manejar diferentes tipos de requests
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // 1. ARCHIVOS ESTÁTICOS (HTML, manifest, icons)
    if (pathname === '/' || 
        pathname === '/index.html' || 
        pathname === '/manifest.json' ||
        pathname.includes('icon-')) {
      return await cacheFirstStrategy(request, STATIC_CACHE);
    }

    // 2. PRODUCTOS.JSON (crítico para la app)
    if (pathname === '/productos.json') {
      return await networkFirstStrategy(request, STATIC_CACHE);
    }

    // 3. IMÁGENES (/imagenes/)
    if (pathname.startsWith('/imagenes/')) {
      return await cacheFirstStrategy(request, IMAGES_CACHE);
    }

    // 4. ARCHIVOS JS/CSS (generados por Vite)
    if (pathname.startsWith('/assets/') || 
        pathname.endsWith('.js') || 
        pathname.endsWith('.css')) {
      return await cacheFirstStrategy(request, STATIC_CACHE);
    }

    // 5. OTROS ARCHIVOS - Network first
    return await networkFirstStrategy(request, DYNAMIC_CACHE);

  } catch (error) {
    console.error('❌ SW: Error manejando request:', error);
    
    // Fallback para navegación
    if (request.mode === 'navigate') {
      const cachedResponse = await caches.match('/index.html');
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Fallback para imágenes
    if (pathname.startsWith('/imagenes/')) {
      return createImageFallback();
    }
    
    return new Response('Contenido no disponible offline', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Estrategia Cache First (para archivos estáticos e imágenes)
async function cacheFirstStrategy(request, cacheName) {
  // Buscar en cache primero
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Encontrado en cache - devolverlo inmediatamente
    return cachedResponse;
  }

  // No está en cache - intentar network
  try {
    const networkResponse = await fetch(request);
    
    // Si la respuesta es válida, cachearla
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      // Clonar la respuesta porque solo se puede usar una vez
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn(`⚠️ SW: No se pudo cargar ${request.url} desde network`);
    throw error;
  }
}

// Estrategia Network First (para productos.json y contenido dinámico)
async function networkFirstStrategy(request, cacheName) {
  try {
    // Intentar network primero
    const networkResponse = await fetch(request);
    
    // Si es exitoso, actualizar cache
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn(`⚠️ SW: Network falló para ${request.url}, buscando en cache`);
    
    // Network falló - buscar en cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Crear imagen fallback para cuando no hay conectividad
function createImageFallback() {
  // SVG simple que indica "imagen no disponible offline"
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#E3D4C1"/>
      <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="14" 
            fill="#8F6A50" text-anchor="middle" dy=".3em">📱</text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="12" 
            fill="#8F6A50" text-anchor="middle" dy=".3em">Offline</text>
      <text x="50%" y="75%" font-family="Arial, sans-serif" font-size="10" 
            fill="#8F6A50" text-anchor="middle" dy=".3em">Imagen no disponible</text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store'
    }
  });
}

// Manejar actualizaciones del Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 SW: Actualizando Service Worker...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

// Sincronización en background (cuando vuelve la conectividad)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 SW: Sincronización en background');
    event.waitUntil(
      // Aquí podrías sincronizar pedidos guardados offline
      syncOfflineData()
    );
  }
});

async function syncOfflineData() {
  try {
    // Placeholder para sincronización futura
    // Podría sincronizar pedidos guardados offline cuando vuelva la conectividad
    console.log('📡 SW: Sincronizando datos offline...');
  } catch (error) {
    console.error('❌ SW: Error en sincronización:', error);
  }
}

// Notificaciones push (para futuras características)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Si hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url === self.location.origin && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

console.log('🚀 MARÉ Service Worker cargado - Versión:', CACHE_VERSION);
