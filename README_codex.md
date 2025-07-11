# MARÉ – Catálogo mayorista digital (Versión LAB)

Este repositorio es una copia paralela del sistema oficial de catálogo mayorista de la marca MARÉ. Su objetivo es servir como entorno de prueba y mejora mediante inteligencia artificial (Codex), sin afectar el sistema en producción.

## 🔧 Stack utilizado

- React 18 + TypeScript
- Vite
- Tailwind CSS (con colores personalizados de marca)
- Lucide React Icons
- PWA (Service Worker + Manifest)
- JSON generado desde Excel (productos)
- GitHub + Vercel

## 🧠 Instrucciones para Codex

🧾 Tarea solicitada –1) Reemplazar encabezado

Reemplazar el texto plano "MARÉ" del header por el logotipo de la marca, ubicado en public/logo-mare.png. Asegurarse que:

El logo sea responsive en celulares y escritorio.

Debajo del logo aparezca un texto más pequeño que diga: By Feraben SRL, en color marrón (#8F6A50) o tono suave, con estilo elegante y sin interferir visualmente.
El logo ya esta creado en el repositorio en la ubicacion public/logo-mare.png

El header mantenga la estética general y no se superponga con los botones de carrito, WhatsApp, etc.

2)Modo lectura rápida por categoría (estilo "cuadrícula sin detalles") 
✅ Idea UX:
Muchos clientes solo quieren scrollear rápido visualmente.
Agregá un switch: “📷 Ver solo imágenes grandes” → oculta precios, códigos, etc.
Ideal para celulares.
