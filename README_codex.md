# Proyecto: Catálogo Mayorista MARÉ – Versión Optimizada para Codex

Este repositorio contiene una copia limpia y funcional del catálogo mayorista de MARÉ. La app está publicada en Vercel y sincronizada con este repositorio para pruebas, mejoras y evolución continua, en conjunto con Codex.

## Objetivo

Codex debe ayudar a mejorar y automatizar este catálogo con foco en:

- Mejorar experiencia visual del cliente
- Agregar feedback e interacción intuitiva
- Incorporar nuevas funciones solicitadas por el propietario
- Eliminar pasos innecesarios (clave)
- Hacer el sistema más ágil y escalable

---

## Cambios clave que se deben aplicar

1. **Eliminar el login por clave**
   - Ya no se usará la clave "mare2025"
   - Reemplazar este acceso por un **formulario simple** que solicite al cliente su **nombre de comercio o razón social** antes de ingresar
   - Guardar esta información temporalmente para usarla al generar el pedido (en encabezado del resumen enviado por WhatsApp o PDF)

2. **Agregar cartel de bienvenida administrado por archivo externo**
   - Crear un sistema para leer un archivo de texto (por ejemplo, `mensaje.txt`)
   - Si ese archivo existe y contiene texto, mostrar un mensaje fijo en la parte superior del catálogo (puede incluir emojis)
   - Si está vacío o no existe, no mostrar nada

3. **Mantener la estructura actual**
   - El catálogo funciona correctamente: colores, cantidades, botón "Agregar al pedido", estructura del carrito, todo está bien
   - Codex solo debe perfeccionar lo solicitado, sin modificar estructura principal

---

## Tecnologías utilizadas

- React + Vite + TypeScript
- TailwindCSS
- JSON como base de productos
- Hosting: Vercel
- Control de versiones: GitHub

---

## Repositorio original

Este proyecto fue clonado desde [Ferabensrl/mare-catalog](https://github.com/Ferabensrl/mare-catalog) como base estable.

---
