const fs = require('fs');
const path = require('path');

// Cargar productos del JSON para obtener los códigos correctos
function cargarProductos() {
    try {
        const productos = JSON.parse(fs.readFileSync('./public/productos.json', 'utf8'));
        return productos.map(p => p.codigo);
    } catch (error) {
        console.error('❌ Error cargando productos.json:', error.message);
        return [];
    }
}

// Función para encontrar coincidencias aproximadas
function encontrarCoincidencia(nombreArchivo, codigos) {
    // Extraer la parte del código del nombre del archivo
    const match = nombreArchivo.match(/^([A-Z0-9]+)(\s+\d+|\s+VARIANTES)?\.jpg$/i);
    if (!match) return null;
    
    const codigoArchivo = match[1];
    
    // Buscar coincidencia exacta
    if (codigos.includes(codigoArchivo)) {
        return codigoArchivo;
    }
    
    // Buscar coincidencias con guiones
    for (const codigo of codigos) {
        const codigoSinGuion = codigo.replace(/-/g, '');
        if (codigoSinGuion === codigoArchivo) {
            return codigo;
        }
    }
    
    return null;
}

// Función principal
function analizarYRenombrar(carpetaImagenes, ejecutarRenombrado = false) {
    console.log('🔍 Analizando nombres de archivos...\n');
    
    const codigos = cargarProductos();
    if (codigos.length === 0) {
        console.log('❌ No se pudieron cargar los códigos de productos');
        return;
    }
    
    console.log(`📊 Códigos de productos cargados: ${codigos.length}`);
    
    if (!fs.existsSync(carpetaImagenes)) {
        console.log(`❌ Carpeta no encontrada: ${carpetaImagenes}`);
        return;
    }
    
    const archivos = fs.readdirSync(carpetaImagenes).filter(f => f.toLowerCase().endsWith('.jpg'));
    console.log(`📁 Archivos JPG encontrados: ${archivos.length}\n`);
    
    const renombrados = [];
    const noEncontrados = [];
    const correctos = [];
    
    for (const archivo of archivos) {
        const codigoCorreclo = encontrarCoincidencia(archivo, codigos);
        
        if (!codigoCorreclo) {
            noEncontrados.push(archivo);
            continue;
        }
        
        // Generar nombre correcto
        const esVariantes = archivo.toLowerCase().includes('variantes');
        const numeroMatch = archivo.match(/\s+(\d+)\.jpg$/i);
        
        let nombreCorrecto;
        if (esVariantes) {
            nombreCorrecto = `${codigoCorreclo} VARIANTES.jpg`;
        } else if (numeroMatch) {
            nombreCorrecto = `${codigoCorreclo} ${numeroMatch[1]}.jpg`;
        } else {
            nombreCorrecto = `${codigoCorreclo}.jpg`;
        }
        
        if (archivo === nombreCorrecto) {
            correctos.push(archivo);
        } else {
            renombrados.push({
                actual: archivo,
                nuevo: nombreCorrecto,
                ruta: path.join(carpetaImagenes, archivo),
                nuevaRuta: path.join(carpetaImagenes, nombreCorrecto)
            });
        }
    }
    
    // Mostrar resultados
    console.log('📊 RESULTADOS DEL ANÁLISIS:');
    console.log(`✅ Archivos correctos: ${correctos.length}`);
    console.log(`🔄 Archivos a renombrar: ${renombrados.length}`);
    console.log(`❌ Archivos sin coincidencia: ${noEncontrados.length}\n`);
    
    if (renombrados.length > 0) {
        console.log('🔄 ARCHIVOS A RENOMBRAR:');
        renombrados.forEach((item, index) => {
            console.log(`${index + 1}. ${item.actual} → ${item.nuevo}`);
        });
        console.log();
    }
    
    if (noEncontrados.length > 0) {
        console.log('❌ ARCHIVOS SIN COINCIDENCIA:');
        noEncontrados.forEach((archivo, index) => {
            console.log(`${index + 1}. ${archivo}`);
        });
        console.log();
    }
    
    // Ejecutar renombrado si se solicita
    if (ejecutarRenombrado && renombrados.length > 0) {
        console.log('🚀 EJECUTANDO RENOMBRADO...');
        let exitosos = 0;
        let errores = 0;
        
        for (const item of renombrados) {
            try {
                // Verificar que el archivo nuevo no exista
                if (fs.existsSync(item.nuevaRuta)) {
                    console.log(`⚠️  Ya existe: ${item.nuevo}`);
                    continue;
                }
                
                fs.renameSync(item.ruta, item.nuevaRuta);
                console.log(`✅ ${item.actual} → ${item.nuevo}`);
                exitosos++;
            } catch (error) {
                console.log(`❌ Error renombrando ${item.actual}: ${error.message}`);
                errores++;
            }
        }
        
        console.log(`\n🎉 RENOMBRADO COMPLETADO:`);
        console.log(`   ✅ Exitosos: ${exitosos}`);
        console.log(`   ❌ Errores: ${errores}`);
    } else if (!ejecutarRenombrado && renombrados.length > 0) {
        console.log('💡 Para ejecutar el renombrado, usa: node renombrar-imagenes.cjs [carpeta] true');
    }
}

// Obtener argumentos de línea de comandos
const args = process.argv.slice(2);
const carpetaImagenes = args[0] || './imagenes';
const ejecutar = args[1] === 'true';

if (args.length === 0) {
    console.log('📖 USO:');
    console.log('   node renombrar-imagenes.cjs [carpeta] [ejecutar]');
    console.log('');
    console.log('📁 EJEMPLOS:');
    console.log('   node renombrar-imagenes.cjs ./imagenes          # Solo analizar');
    console.log('   node renombrar-imagenes.cjs ./imagenes true     # Analizar y renombrar');
    console.log('   node renombrar-imagenes.cjs ./public/images     # Otra carpeta');
    console.log('');
} else {
    analizarYRenombrar(carpetaImagenes, ejecutar);
}
