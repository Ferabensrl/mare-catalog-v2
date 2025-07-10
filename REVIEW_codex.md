# Código auditado por Codex

Este documento resume observaciones y sugerencias tras revisar la base de código del catálogo MARÉ.

## Observaciones generales

- **Estructura monolítica**: todo el comportamiento (login, productos, carrito, modales) reside en `src/App.tsx`. Separar componentes facilitaría el mantenimiento.
- **Manejo de estado**: se usan múltiples `useState` y efectos. Para futuros crecimientos podría evaluarse un manejador de estado (React Context o una librería ligera) para desacoplar lógica de UI.
- **Persistencia**: se guardan datos en `localStorage` sin expiración. Considerar limpiar entradas obsoletas para evitar inconsistencias.
- **Accesibilidad**: algunos botones carecen de etiqueta `aria-label` y las imágenes usan textos genéricos. Revisar para mejorar soporte de lectores de pantalla.
- **Errores en imágenes**: al fallar la carga se reemplaza por un SVG base64. Puede optimizarse con un componente `<img>` reutilizable.
- **Responsive**: las tarjetas contienen muchos controles que podrían saturar pantallas muy pequeñas. Se sugiere revisar tamaños mínimos y desplazamientos.
- **Carga de datos**: el fetch de `productos.json` no gestiona reintentos ni informa al usuario si falla. Mostrar un mensaje de error mejoraría la UX.

## Sugerencias de mejora

1. **Dividir en componentes**: `ProductCard`, `CartModal` y `ImageGalleryModal` podrían moverse a archivos separados.
2. **TypeScript estricto**: activar `strictNullChecks` y revisar tipos opcionales para prevenir fallos en tiempo de ejecución.
3. **Hooks personalizados**: crear hooks para manejar carrito y persistencia evitaría lógica duplicada.
4. **Validación de entrada**: sanitizar la cantidad ingresada para evitar valores negativos o no numéricos.
5. **Pruebas automáticas**: incluir tests básicos (React Testing Library) para componentes críticos.
6. **Mejorar manifest PWA**: añadir íconos para distintos tamaños y comprobar que el color de tema coincida con la marca.

Estas notas buscan aportar una visión general; no representan fallos críticos pero sí oportunidades para seguir mejorando el proyecto.
