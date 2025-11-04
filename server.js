import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());

// Función para ejecutar comandos de manera segura
function ejecutarComando(comando) {
    return new Promise((resolve) => {
        console.log(`Ejecutando: ${comando}`);
        
        exec(comando, { 
            cwd: __dirname,
            encoding: 'utf8',
            timeout: 120000 // 2 minutos de timeout
        }, (error, stdout, stderr) => {
            const output = stdout + (stderr ? `\nErrores: ${stderr}` : '');
            
            if (error) {
                // Casos especiales donde el "error" no es realmente un problema
                if (error.message.includes('nothing to commit') || 
                    error.message.includes('no changes added')) {
                    console.log(`ℹ️ Sin cambios para hacer commit`);
                    resolve({
                        success: true,
                        output: 'Sin cambios para hacer commit',
                        noChanges: true
                    });
                } else {
                    console.error(`Error ejecutando "${comando}":`, error.message);
                    resolve({
                        success: false,
                        error: error.message,
                        output: output
                    });
                }
            } else {
                console.log(`✅ Comando completado: ${comando}`);
                resolve({
                    success: true,
                    output: output
                });
            }
        });
    });
}

// Función específica para verificar si hay cambios en git
function verificarCambiosGit() {
    return new Promise((resolve) => {
        exec('git status --porcelain', { cwd: __dirname }, (error, stdout) => {
            if (error) {
                resolve({ hayCambios: false, error: error.message });
            } else {
                resolve({ hayCambios: stdout.trim().length > 0, archivos: stdout.trim() });
            }
        });
    });
}

// Ruta para ejecutar comandos
app.post('/ejecutar', async (req, res) => {
    try {
        const { comando, descripcion, mensaje } = req.body;
        
        if (!comando) {
            return res.json({
                success: false,
                error: 'No se proporcionó comando'
            });
        }

        console.log(`\n🔄 Iniciando: ${descripcion || comando}`);
        
        // Caso especial para guardar mensaje
        if (comando.startsWith('echo ') && comando.includes('> mensaje.txt')) {
            try {
                fs.writeFileSync('./mensaje.txt', mensaje || '', 'utf8');
                res.json({
                    success: true,
                    output: 'Mensaje guardado correctamente'
                });
                return;
            } catch (error) {
                res.json({
                    success: false,
                    error: `Error guardando mensaje: ${error.message}`
                });
                return;
            }
        }
        
        const resultado = await ejecutarComando(comando);
        
        res.json(resultado);
        
    } catch (error) {
        console.error('Error en endpoint /ejecutar:', error);
        res.json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Ruta para obtener el mensaje actual
app.get('/mensaje-actual', (req, res) => {
    try {
        const mensajePath = './mensaje.txt';

        if (fs.existsSync(mensajePath)) {
            const mensaje = fs.readFileSync(mensajePath, 'utf8').trim();
            res.json({ mensaje });
        } else {
            res.json({ mensaje: '' });
        }
    } catch (error) {
        console.error('Error leyendo mensaje:', error);
        res.json({ mensaje: '' });
    }
});

// Ruta para obtener estadísticas del catálogo y website
app.get('/estadisticas', (req, res) => {
    try {
        const stats = {
            catalogo: {
                productos: 0,
                categorias: 0,
                imagenes: { count: 0, sizeMB: 0 },
                sinImagenes: 0,
                conVariantes: 0,
                ultimaActualizacion: null
            },
            website: {
                productos: 0,
                imagenes: { count: 0, sizeMB: 0 },
                ultimaSincronizacion: null
            },
            diferencias: {
                productos: 0,
                imagenes: 0
            }
        };

        // Estadísticas del CATÁLOGO
        const catalogoPath = path.join(__dirname, 'public', 'productos.json');
        if (fs.existsSync(catalogoPath)) {
            const catalogoData = JSON.parse(fs.readFileSync(catalogoPath, 'utf8'));
            const productos = catalogoData.productos || catalogoData;

            stats.catalogo.productos = productos.length;
            stats.catalogo.categorias = new Set(productos.map(p => p.categoria)).size;
            stats.catalogo.sinImagenes = productos.filter(p => !p.imagenes || p.imagenes.length === 0).length;
            stats.catalogo.conVariantes = productos.filter(p => p.imagenVariantes || (p.variantes && Object.keys(p.variantes).length > 0)).length;

            // Fecha de última modificación del archivo
            const catalogoStats = fs.statSync(catalogoPath);
            stats.catalogo.ultimaActualizacion = catalogoStats.mtime;
        }

        // Estadísticas de IMÁGENES del catálogo
        const imagenesPath = path.join(__dirname, 'public', 'imagenes');
        if (fs.existsSync(imagenesPath)) {
            const archivos = fs.readdirSync(imagenesPath);
            stats.catalogo.imagenes.count = archivos.length;

            let totalSize = 0;
            archivos.forEach(file => {
                const filePath = path.join(imagenesPath, file);
                const fileStats = fs.statSync(filePath);
                if (fileStats.isFile()) {
                    totalSize += fileStats.size;
                }
            });
            stats.catalogo.imagenes.sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        }

        // Estadísticas del WEBSITE
        const websitePath = 'C:\\Users\\Usuario\\FERABEN_MARE\\mare-website\\src\\data\\productos-web.json';
        if (fs.existsSync(websitePath)) {
            const websiteData = JSON.parse(fs.readFileSync(websitePath, 'utf8'));
            stats.website.productos = websiteData.length;

            const websiteStats = fs.statSync(websitePath);
            stats.website.ultimaSincronizacion = websiteStats.mtime;
        }

        // Estadísticas de IMÁGENES del website
        const websiteImagenesPath = 'C:\\Users\\Usuario\\FERABEN_MARE\\mare-website\\public\\imagenes';
        if (fs.existsSync(websiteImagenesPath)) {
            const archivos = fs.readdirSync(websiteImagenesPath);
            stats.website.imagenes.count = archivos.length;

            let totalSize = 0;
            archivos.forEach(file => {
                const filePath = path.join(websiteImagenesPath, file);
                const fileStats = fs.statSync(filePath);
                if (fileStats.isFile()) {
                    totalSize += fileStats.size;
                }
            });
            stats.website.imagenes.sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        }

        // Calcular diferencias
        stats.diferencias.productos = stats.catalogo.productos - stats.website.productos;
        stats.diferencias.imagenes = stats.catalogo.imagenes.count - stats.website.imagenes.count;

        res.json(stats);

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
});

// Ruta principal - servir el HTML
app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'catalogo-manager.html'));
    } catch (error) {
        console.error('Error sirviendo HTML:', error);
        res.status(500).send('Error cargando la aplicación');
    }
});

// Servir archivos estáticos solo para recursos específicos
app.use('/static', express.static('.'));

// Manejo de errores globales
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('\n🚀 ================================');
    console.log('🛍️  MARE CATÁLOGO MANAGER');
    console.log('🚀 ================================');
    console.log(`✅ Servidor iniciado en puerto ${PORT}`);
    console.log(`🌐 Abre tu navegador en: http://localhost:${PORT}`);
    console.log('📁 Directorio de trabajo:', __dirname);
    console.log('🚀 ================================\n');
    
    // Intentar abrir automáticamente el navegador
    const start = process.platform === 'darwin' ? 'open' : 
                  process.platform === 'win32' ? 'start' : 'xdg-open';
    
    exec(`${start} http://localhost:${PORT}`, (error) => {
        if (error) {
            console.log('💡 No se pudo abrir el navegador automáticamente.');
            console.log(`   Abre manualmente: http://localhost:${PORT}`);
        }
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Cerrando Mare Catálogo Manager...');
    console.log('✅ ¡Hasta luego!');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n👋 Cerrando Mare Catálogo Manager...');
    console.log('✅ ¡Hasta luego!');
    process.exit(0);
});