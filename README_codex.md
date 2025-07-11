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

✅ PEDIDO PARA CODEX
Hola Codex, necesito aplicar dos ajustes finales a la app para cerrar esta etapa:

1) Mostrar descripción del producto en el mensaje de WhatsApp
Actualmente, al generar el mensaje de pedido por WhatsApp solo se ve el código del producto. Quiero que también aparezca la descripción del producto, justo al lado del código, tal como ya está implementado correctamente en el PDF.
Esto es para que el personal de depósito pueda identificar los productos fácilmente cuando preparan los pedidos.

🔸 Ejemplo deseado en el mensaje:

yaml
Copiar
Editar
🛒 LB233 – Aros Acero Dorado  
• Negro: 2 unidades  
• Blanco: 3 unidades  
2) Agrandar los logos
En la pantalla de Login, quiero que el logo de MARÉ se vea mucho más grande, que sea lo primero que se destaque al ingresar.

En el header del catálogo, también me gustaría que el logo esté un poco más grande, sin romper el diseño, pero que se luzca mejor especialmente en pantallas de PC.

Gracias Codex por todo, con esto dejamos cerrada la app para empezar a trabajar con ella 😊
