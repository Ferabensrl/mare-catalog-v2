@echo off
title Mare Catalogo Manager
color 0A

echo.
echo ================================================
echo        🛍️  MARE CATALOGO MANAGER 🛍️
echo ================================================
echo.
echo ✅ Iniciando servidor local...
echo 🌐 Se abrira automaticamente en tu navegador
echo.
echo ⚠️  IMPORTANTE: NO CIERRES ESTA VENTANA
echo    El programa funciona mientras esta ventana este abierta
echo.
echo 🔄 Para cerrar el programa: Ctrl + C o cierra esta ventana
echo.
echo ================================================
echo.

cd /d "%~dp0"

if not exist "node_modules\express" (
    echo 📦 Instalando dependencias por primera vez...
    echo    Esto puede tomar unos minutos...
    echo.
    npm install express
    echo.
    echo ✅ Dependencias instaladas!
    echo.
)

node server.js

echo.
echo ================================================
echo 👋 Mare Catalogo Manager ha sido cerrado
echo ================================================
pause