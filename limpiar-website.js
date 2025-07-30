/**
 * Script para limpiar imágenes no utilizadas del website
 * Detecta y elimina imágenes huérfanas para optimizar el repositorio
 */

import fs from 'fs';
import path from 'path';

// Configuración
const CONFIG = {
    websiteProductosPath: 'C:\\Users\\Usuario\\mare-website\\src\\data\\productos-web.json',
    websiteImagenesPath: 'C:\\Users\\Usuario\\mare-website\\public\\imagenes\\',
    imagenesEspeciales: [
        'destacado-nueva-coleccion.jpg',
        'destacado-tips-estilo.jpg', 
        'destacado-distribuidores.jpg',
        'sobre-mare.jpg',
        'sobre-feraben.jpg',
        'mareuy-logo.png',
        '.gitkeep'
    ]
};

/**
 * Obtiene todas las imágenes referenciadas en productos
 */
function obtenerImagenesEnUso() {
    try {
        if (!fs.existsSync(CONFIG.websiteProductosPath)) {
            throw new Error('Archivo de productos del website no encontrado');
        }
        
        const productosData = fs.readFileSync(CONFIG.websiteProductosPath, 'utf8');
        const productos = JSON.parse(productosData);
        
        const imagenesEnUso = new Set();
        
        productos.forEach(producto => {
            // Imágenes principales
            if (producto.imagenes && Array.isArray(producto.imagenes)) {
                producto.imagenes.forEach(img => {
                    if (img && img.trim()) {
                        imagenesEnUso.add(img.trim());
                    }
                });
            }
            
            // Imagen de variantes
            if (producto.imagenVariantes && producto.imagenVariantes.trim()) {
                imagenesEnUso.add(producto.imagenVariantes.trim());
            }
        });
        
        // Agregar imágenes especiales que siempre se deben mantener
        CONFIG.imagenesEspeciales.forEach(img => {
            imagenesEnUso.add(img);
        });
        
        return imagenesEnUso;
        
    } catch (error) {
        console.error('❌ Error obteniendo imágenes en uso:', error.message);
        return new Set();
    }
}

/**
 * Limpia imágenes huérfanas del website
 */
async function limpiarImagenesWebsite() {
    try {
        console.log('🧹 LIMPIEZA DE IMÁGENES DEL WEBSITE');
        console.log('===================================\n');
        
        // Verificar directorio de imágenes
        if (!fs.existsSync(CONFIG.websiteImagenesPath)) {
            console.log('⚠️  Directorio de imágenes del website no encontrado');
            return false;
        }
        
        // Obtener imágenes en uso
        console.log('📋 Analizando productos del website...');
        const imagenesEnUso = obtenerImagenesEnUso();
        console.log(`✅ Encontradas ${imagenesEnUso.size} imágenes en uso`);
        
        // Obtener todas las imágenes en el directorio
        const todasLasImagenes = fs.readdirSync(CONFIG.websiteImagenesPath);
        console.log(`📁 Encontrados ${todasLasImagenes.length} archivos en directorio`);
        
        // Encontrar imágenes huérfanas
        const imagenesHuerfanas = [];
        
        todasLasImagenes.forEach(archivo => {
            if (!imagenesEnUso.has(archivo)) {
                imagenesHuerfanas.push(archivo);
            }
        });
        
        console.log(`\n🗑️  Encontradas ${imagenesHuerfanas.length} imágenes huérfanas:`);
        
        if (imagenesHuerfanas.length === 0) {
            console.log('✨ ¡No hay imágenes huérfanas! El repositorio ya está optimizado.');
            return true;
        }
        
        // Mostrar lista de archivos a eliminar
        imagenesHuerfanas.forEach(img => {
            console.log(`   - ${img}`);
        });
        
        // Eliminar imágenes huérfanas
        let eliminadas = 0;
        let errores = 0;
        
        console.log(`\n🗑️  Eliminando imágenes huérfanas...`);
        
        for (const imagen of imagenesHuerfanas) {
            try {
                const rutaCompleta = path.join(CONFIG.websiteImagenesPath, imagen);
                fs.unlinkSync(rutaCompleta);
                eliminadas++;
                console.log(`   ✅ Eliminada: ${imagen}`);
            } catch (error) {
                errores++;
                console.log(`   ❌ Error eliminando ${imagen}: ${error.message}`);
            }
        }
        
        // Resumen final
        console.log(`\n📊 RESUMEN DE LIMPIEZA:`);
        console.log(`   - Archivos eliminados: ${eliminadas}`);
        console.log(`   - Errores: ${errores}`);
        console.log(`   - Imágenes restantes: ${todasLasImagenes.length - eliminadas}`);
        
        if (eliminadas > 0) {
            console.log(`\n🎉 ¡Limpieza completada! Repositorio optimizado.`);
            console.log(`   Liberados aproximadamente ${eliminadas} archivos de imagen.`);
        }
        
        return true;
        
    } catch (error) {
        console.error('💥 Error durante la limpieza:', error.message);
        return false;
    }
}

// Ejecutar cuando se llama directamente
console.log('🧹 Iniciando limpieza de imágenes del website...');
limpiarImagenesWebsite()
    .then(success => {
        console.log(success ? '\n✅ Limpieza exitosa' : '\n❌ Limpieza falló');
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });

export { limpiarImagenesWebsite };