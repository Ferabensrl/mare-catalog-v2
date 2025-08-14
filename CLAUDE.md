# DOCUMENTACIÓN TÉCNICA - MARÉ CATÁLOGO v2

## 📋 RESUMEN DE MEJORAS IMPLEMENTADAS

Este documento detalla las mejoras y funcionalidades implementadas en el catálogo mayorista MARÉ durante la sesión de desarrollo.

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### 1. 🛒 **EDICIÓN DE CANTIDADES EN CARRITO**

**Problema original:** Los clientes solo podían eliminar productos completos del carrito. Para cambiar cantidades tenían que eliminar y volver a buscar el producto.

**Solución implementada:**
- Controles +/- para cada opción (colores, variantes, surtido)
- Input directo para edición rápida de cantidades
- Confirmación antes de eliminar cuando cantidad = 0
- Limpieza automática de productos sin cantidades
- Interfaz responsive para móvil y desktop

**Archivos modificados:**
- `src/App.tsx`: Función `updateCartItemQuantity()` y componente `CartModal`

**Cómo funciona:**
```javascript
const updateCartItemQuantity = (index: number, opcion: string, newQuantity: number) => {
  const newCart = [...cart];
  if (opcion === 'surtido') {
    newCart[index].surtido = Math.max(0, newQuantity);
  } else {
    newCart[index].selecciones[opcion] = Math.max(0, newQuantity);
  }
  
  // Limpiar productos que no tienen cantidades
  const updatedCart = newCart.filter(item => {
    const hasSelections = Object.values(item.selecciones).some(qty => qty > 0);
    const hasSurtido = item.surtido && item.surtido > 0;
    return hasSelections || hasSurtido;
  });
  
  setCart(updatedCart);
};
```

---

### 2. 📅 **CACHE DIARIO INTELIGENTE**

**Problema original:** La aplicación no funcionaba correctamente offline después de refresh, y había conflictos entre actualización inmediata de productos y funcionalidad offline.

**Solución implementada:**
- Cache diario que se renueva automáticamente cada día a las 00:00
- Lógica híbrida: Fresh para testing + Cache diario para trabajo offline
- Limpieza automática de caches antiguos

**Archivos modificados:**
- `public/sw.js` y `dist/sw.js`: Service Worker v1.3.0

**Cómo funciona:**

```javascript
async function handleProductsJson(request) {
  const today = new Date().toISOString().split('T')[0]; // "2025-08-13"
  const cacheKey = `/productos.json-${today}`;
  
  // LÓGICA HÍBRIDA: Online vs Offline
  if (navigator.onLine) {
    // Con internet: SIEMPRE intentar fresh primero (para testing/actualizaciones)
    const freshResponse = await fetch('/productos.json?v=' + Date.now());
    if (freshResponse.ok) {
      // Guardar fresh en cache del día
      await cache.put(cacheKey, freshResponse.clone());
      await cleanOldProductCaches();
      return freshResponse;
    }
  }
  
  // Offline: usar cache del día actual
  const todayCache = await cache.match(cacheKey);
  if (todayCache) return todayCache;
}
```

**Beneficios:**
- **Para desarrolladores:** Ven cambios inmediatamente con internet
- **Para vendedores:** Una descarga por día, resto offline
- **Automático:** Sin intervención manual

---

### 3. 📱 **WHATSAPP NATIVO EN TABLETS**

**Problema original:** Los enlaces de WhatsApp abrían WhatsApp Web incluso en tablets con la app nativa instalada, causando problemas offline.

**Solución implementada:**
- Detección de dispositivo móvil/tablet vs desktop
- Intento de protocolo nativo `whatsapp://` primero
- Fallback a WhatsApp Web `wa.me` si falla
- Redirección directa al número +59897998999 sin selector

**Archivos modificados:**
- `src/App.tsx`: Función `openWhatsAppNative()`

**Cómo funciona:**

```javascript
const openWhatsAppNative = (message: string) => {
  const phoneNumber = '59897998999';
  const nativeUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
  const webUrl = `https://wa.me/${phoneNumber}?text=${message}`;
  
  const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobileDevice) {
    // Intentar app nativa primero
    const link = document.createElement('a');
    link.href = nativeUrl;
    link.click();
    
    // Fallback a web después de 2 segundos
    setTimeout(() => {
      window.open(webUrl, '_blank');
    }, 2000);
  } else {
    // Desktop: ir directo a WhatsApp Web
    window.open(webUrl, '_blank');
  }
};
```

**Beneficios:**
- Mejor experiencia offline en tablets
- Sin selector de contactos (evita errores)
- Funcionalidad nativa de WhatsApp para cola de mensajes

---

## 🔧 CONFIGURACIÓN PARA VENDEDORES

### Rutina Diaria Recomendada:
```
1. Conectar tablet a WiFi
2. Abrir aplicación MARÉ
3. Esperar carga completa (5 segundos)
4. Cerrar aplicación
5. Trabajar offline todo el día
```

### ¿Por qué funciona?
- Primera apertura del día descarga automáticamente la versión más reciente
- Cache diario garantiza funcionamiento offline
- WhatsApp nativo maneja cola de mensajes sin internet

---

## 📊 TESTING Y MONITOREO

### Logs del Service Worker:
```
📅 SW: Manejando productos.json para 2025-08-13
🌐 SW: Online - intentando descarga fresh
✅ SW: Fresh descargado, actualizando cache del día
🧹 SW: Limpiando caches antiguos
```

### Logs de WhatsApp:
```
📱 Intentando abrir WhatsApp app nativa
🌐 Fallback: Abriendo WhatsApp Web
🖥️ Desktop: Abriendo WhatsApp Web
```

### Para testing de actualizaciones:
- Con internet: Los cambios en `productos.json` se ven inmediatamente
- Sin internet: Usa cache del día actual
- Cambio de día: Se descarga automáticamente nueva versión

---

## 🏗️ ARQUITECTURA TÉCNICA

### Service Worker (v1.3.0):
- **Cache estático**: HTML, CSS, JS, manifest
- **Cache diario**: productos.json con clave por fecha
- **Cache de imágenes**: Imágenes de productos
- **Estrategias**: Cache-first para estáticos, Network-first híbrido para productos

### React App:
- **Estado del carrito**: Persistente en localStorage
- **Edición de cantidades**: Componente CartModal optimizado
- **WhatsApp integración**: Detección de plataforma y protocolo

### PWA Features:
- **Offline-first**: Funciona sin internet después de primera carga
- **App-like**: Iconos, manifest, instalable
- **Push notifications**: Configurado (no implementado)

---

## 🚀 COMANDOS DE DESARROLLO

### Build:
```bash
npm run build
```

### Commit pattern:
```bash
git add .
git commit -m "🎯 DESCRIPCIÓN: Detalle técnico

✅ FUNCIONALIDAD:
- Punto 1
- Punto 2

🔧 CAMBIOS TÉCNICOS:
- Archivo modificado
- Función implementada

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push
```

---

## 📋 CHECKLIST DE FUNCIONAMIENTO

### ✅ Funcionalidades que deben funcionar:

- [ ] **Edición de cantidades**: Botones +/- en carrito
- [ ] **Cache diario**: Actualizaciones inmediatas con internet
- [ ] **Offline**: Catálogo disponible sin internet después de refresh
- [ ] **WhatsApp PDF**: Abre app nativa en tablets
- [ ] **WhatsApp texto**: Abre app nativa en tablets
- [ ] **Persistencia**: Carrito se guarda automáticamente
- [ ] **Service Worker**: Sin errores en consola F12

### 🔍 Para verificar problemas:

1. **F12 Console**: Buscar errores o warnings
2. **Network tab**: Verificar requests de productos.json
3. **Application > Storage**: Verificar cache del Service Worker
4. **Offline simulation**: DevTools > Network > Offline

---

## 📞 CONTACTO Y SOPORTE

Para problemas técnicos, verificar:
1. Versión del Service Worker en consola
2. Cache de productos.json con fecha actual
3. Logs de WhatsApp en consola

**Última actualización:** Agosto 2025  
**Versión:** v1.3.0-daily-cache  
**Estado:** ✅ Funcional y deployado