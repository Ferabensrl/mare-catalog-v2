import fs from 'fs';
import path from 'path';

console.log('🗑️ Iniciando limpieza de imágenes huérfanas...');

function limpiarImagenes() {
try {
    // 1. Leer el JSON de productos para saber qué imágenes se usan
    const productosPath = './public/productos.json';
    if (!fs.existsSync(productosPath)) {
        console.log('❌ No se encontró el archivo productos.json');
        console.log('   Ejecuta primero "node convertir-completo.cjs"');
        process.exit(1);
    }

    const productos = JSON.parse(fs.readFileSync(productosPath, 'utf8'));
    console.log(`📊 Productos cargados: ${productos.length}`);

    // 2. Recopilar todas las imágenes que SÍ se usan
    const imagenesUsadas = new Set();
    
    productos.forEach(producto => {
        // Imágenes normales (CODIGO 1.jpg, CODIGO 2.jpg, etc.)
        if (producto.imagenes && Array.isArray(producto.imagenes)) {
            producto.imagenes.forEach(img => {
                imagenesUsadas.add(img);
            });
        }
        
        // Imagen de variantes (CODIGO VARIANTES.jpg)
        if (producto.imagenVariantes) {
            imagenesUsadas.add(producto.imagenVariantes);
        }
    });

    console.log(`✅ Imágenes en uso encontradas: ${imagenesUsadas.size}`);

    // 3. Leer todas las imágenes que existen en la carpeta
    const imagenesPath = './public/imagenes';
    if (!fs.existsSync(imagenesPath)) {
        console.log('❌ No se encontró la carpeta public/imagenes');
        process.exit(1);
    }

    const archivosEnCarpeta = fs.readdirSync(imagenesPath);
    const imagenesEnCarpeta = archivosEnCarpeta.filter(archivo => {
        const ext = path.extname(archivo).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    console.log(`📂 Imágenes en carpeta: ${imagenesEnCarpeta.length}`);

    // 4. Identificar imágenes huérfanas (que están en carpeta pero no se usan)
    const imagenesHuerfanas = [];
    
    imagenesEnCarpeta.forEach(imagen => {
        if (!imagenesUsadas.has(imagen)) {
            imagenesHuerfanas.push(imagen);
        }
    });

    console.log(`🔍 Imágenes huérfanas detectadas: ${imagenesHuerfanas.length}`);

    // 5. Mostrar lista de imágenes a eliminar
    if (imagenesHuerfanas.length === 0) {
        console.log('🎉 ¡Perfecto! No hay imágenes huérfanas para eliminar.');
        console.log('   Todas las imágenes en la carpeta están siendo utilizadas.');
        return;
    }

    console.log('\n📋 IMÁGENES QUE SERÁN ELIMINADAS:');
    imagenesHuerfanas.forEach((imagen, index) => {
        console.log(`   ${index + 1}. ${imagen}`);
    });

    // 6. Eliminar las imágenes huérfanas
    let eliminadas = 0;
    let errores = 0;

    console.log('\n🗑️ Eliminando imágenes huérfanas...');
    
    imagenesHuerfanas.forEach(imagen => {
        try {
            const rutaCompleta = path.join(imagenesPath, imagen);
            fs.unlinkSync(rutaCompleta);
            eliminadas++;
            console.log(`   ✅ ${imagen}`);
        } catch (error) {
            errores++;
            console.log(`   ❌ Error eliminando ${imagen}: ${error.message}`);
        }
    });

    // 7. Resumen final
    console.log('\n📊 RESUMEN DE LIMPIEZA:');
    console.log(`   🗑️ Imágenes eliminadas: ${eliminadas}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   💾 Espacio liberado: ~${Math.round(eliminadas * 0.2)} MB (estimado)`);
    
    if (eliminadas > 0) {
        console.log('\n✨ ¡Limpieza completada exitosamente!');
        console.log('   Recuerda hacer commit de estos cambios para actualizar el repositorio.');
    }

    // 8. Estadísticas adicionales
    const imagenesRestantes = imagenesEnCarpeta.length - eliminadas;
    console.log(`\n📈 ESTADÍSTICAS FINALES:`);
    console.log(`   - Imágenes restantes en carpeta: ${imagenesRestantes}`);
    console.log(`   - Imágenes en uso por productos: ${imagenesUsadas.size}`);
    console.log(`   - Eficiencia de limpieza: ${Math.round((eliminadas / imagenesEnCarpeta.length) * 100)}%`);

} catch (error) {
    console.error('💥 ERROR CRÍTICO:', error.message);
    console.error('Detalles:', error.stack);
    process.exit(1);
}
}

// Ejecutar la función
limpiarImagenes();