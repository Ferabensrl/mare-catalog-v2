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

Este entorno fue creado específicamente para que Codex pueda:

1. Realizar un **análisis profundo** del código fuente, identificando:
   - Organización del proyecto
   - Componentes principales y su interacción
   - Errores de sintaxis, redundancias o prácticas incorrectas
   - Posibles mejoras en rendimiento, legibilidad o accesibilidad
   - Sugerencias visuales y de experiencia de usuario (UX)

2. Detectar errores **aunque sean pequeños o poco visibles**, incluyendo:
   - Variables no utilizadas
   - Hooks mal empleados
   - Importaciones innecesarias
   - Claves `key` mal aplicadas
   - Código que puede fallar en móvil
   - Reglas CSS conflictivas
   - Renderizados innecesarios

3. Brindar ideas de mejora aunque no hayan sido solicitadas, siempre que mejoren la experiencia o eviten errores.

4. Emitir un archivo `REVIEW_codex.md` con todas las observaciones, mejoras sugeridas y alertas.

## ✅ Funcionalidad actual

- Catálogo de más de 270 productos
- Organización por categoría
- Selección por color, surtido y variantes
- Galería de imágenes
- Carrito de pedidos (WhatsApp)
- Carga dinámica desde JSON generado vía `convertir-excel.js`
- Modo PWA y funcionamiento offline
- Adaptado a celular/tablet/PC

## ✅ Cambios previos esperados por Codex

- El sistema de clave (`mare2025`) implementado en `App.tsx` debe ser **eliminado completamente**
- Esta lógica no debe mantenerse ni reconstruirse
- El objetivo es permitir acceso libre al catálogo para simplificar la experiencia del cliente
- Necesitamos que la app solamente solicite un login sencillo "Nombre de comercio o Razón social", y estos datos serán utilizados para mostrarlos siempre arriba en la app, para que el cliente pueda verificar que esta asignado a el el pedido y tambien cuando se hace el envio del mensaje por whatsapp del pedido o se crea el pdf, el pedido tiene nombre del cliente para identificar y hacer el tracking correspondiente en la empresa

## ✨ Mejoras deseadas (ordenadas por prioridad)

1. **Recategorización visual de productos**
   - El campo `estado` puede ser `Preventa`, `Oferta`, `Poco stock`, `Novedades`, etc.
   - Mostrar una etiqueta visual (cinta, badge o texto sobre la imagen) según el estado
   - Permitir filtrar por esos estados

2. **Feedback visual en botón “Agregar al Pedido”**
   - Al hacer clic, cambiar color, mostrar ✔️ y texto “¡Agregado!” por unos segundos

3. **Indicador visual de productos ya agregados**
   - Borde `#8F6A50`, ícono de carrito, y cantidad visible directamente en el card

4. **Generar pedido como PDF**
   - Eliminar opción de enviar por email
   - Agregar botón para generar y descargar PDF del pedido actual
   - Enviar por WhatsApp directamente como archivo

5. **Mostrar logo MARÉ en el header**
   - Reemplazar el texto plano por el logotipo oficial

6. **Mostrar aviso de precios con IVA**
   - Agregar texto visible: “💡 Todos los precios incluyen IVA”
   - Agregar número de contacto con botón directo a WhatsApp

7. **Eliminar acceso con clave**
   - Remover del código el sistema que requiere clave para ver el catálogo
   - No debe volver a implementarse a menos que se indique

8. **Cartel promocional desde archivo externo `.txt`**
   - Crear un sistema donde el contenido de un archivo `mensaje.txt` se lea y convierta a un archivo `mensaje.json` mediante un script (`mensaje-to-json.js`)
   - Ese `mensaje.json` contendrá la propiedad `mensaje_portada`
   - En la app, si ese mensaje existe, se muestra arriba del catálogo con diseño visual claro (borde, ícono, fondo sutil)
   - Si el archivo está vacío, no se muestra nada
   - No debe interferir con `productos.json`

> Este sistema le permite al administrador actualizar el mensaje sin tocar el Excel ni regenerar los productos. Solo cambia el `.txt`, ejecuta el script y el nuevo mensaje aparece automáticamente.
