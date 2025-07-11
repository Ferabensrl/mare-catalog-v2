# 📱 MARÉ - Catálogo Mayorista

Aplicación web progresiva (PWA) para el catálogo mayorista de accesorios MARÉ.

## 🚀 Características

- ✅ Catálogo completo con 270+ productos
- ✅ 18 categorías organizadas
- ✅ Sistema de colores y variantes
- ✅ Carrito de pedidos mayoristas
- ✅ Galería de imágenes con zoom
- ✅ Mensajes WhatsApp estructurados
- ✅ PWA instalable como app
- ✅ Funciona offline
- ✅ 100% responsive
- ✅ Encabezado con logo y tagline "By Feraben SRL"
- ✅ Opción "Ver solo imágenes grandes" para navegación rápida

## 🔧 Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Convertir Excel a JSON
npm run convert

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Convertir mensaje promocional
npm run mensaje
```

## 📢 Mensaje promocional en portada

El archivo `mensaje.txt` contiene un texto opcional que se muestra arriba del catálogo.
Ejecuta `npm run mensaje` para convertirlo a `public/mensaje.json`. Si el texto está vacío, no se visualiza ningún aviso.

## 🔐 Login simplificado

Al ingresar a la aplicación solo se solicita **Nombre o Razón Social** para personalizar los pedidos.

## 👀 Modo lectura rápida

Presiona el botón **📷 Ver solo imágenes grandes** en la barra superior para ocultar precios y detalles, dejando solo las fotos en una cuadrícula amplia.
Vuelve a presionarlo para restablecer la vista completa.
