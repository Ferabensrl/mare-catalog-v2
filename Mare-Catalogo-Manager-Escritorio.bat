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

REM Cambiar al directorio del proyecto (ajusta esta ruta si tu proyecto está en otro lugar)
cd /d "C:\Users\Usuario\mare-catalog-v2"

REM Verificar que estamos en el directorio correcto
if not exist "server.js" (
    echo ❌ ERROR: No se encontró el proyecto Mare Catalog
    echo.
    echo 🔍 Buscando en ubicaciones comunes...
    
    REM Intentar algunas ubicaciones comunes
    if exist "C:\Users\%USERNAME%\mare-catalog-v2\server.js" (
        cd /d "C:\Users\%USERNAME%\mare-catalog-v2"
        echo ✅ Proyecto encontrado en: C:\Users\%USERNAME%\mare-catalog-v2
    ) else if exist "C:\mare-catalog-v2\server.js" (
        cd /d "C:\mare-catalog-v2"
        echo ✅ Proyecto encontrado en: C:\mare-catalog-v2
    ) else if exist "%USERPROFILE%\Documents\mare-catalog-v2\server.js" (
        cd /d "%USERPROFILE%\Documents\mare-catalog-v2"
        echo ✅ Proyecto encontrado en: %USERPROFILE%\Documents\mare-catalog-v2
    ) else (
        echo.
        echo ❌ No se pudo encontrar el proyecto Mare Catalog
        echo    Por favor verifica que el proyecto esté en:
        echo    C:\Users\Usuario\mare-catalog-v2
        echo.
        echo 📝 O edita este archivo .bat y cambia la ruta en la línea 20
        echo.
        pause
        exit /b 1
    )
)

echo 📁 Directorio de trabajo: %CD%
echo.

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