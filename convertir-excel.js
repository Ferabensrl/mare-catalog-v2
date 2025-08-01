// convertir-excel.js - Script para convertir Excel a JSON con búsqueda automática de imágenes
import * as XLSX from 'xlsx';
import { writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// MAPEO EXACTO DE COLORES (U-BC = índices 20-54)
const COLORES = [
    'Negro', 'Blanco', 'Dorado', 'Plateado', 'Acero', 'Nude', 'Tonos marrones',
    'Tonos pastel', 'Varios colores', 'Amarillo', 'Verde', 'Lila', 'Celeste',
    'Rosado', 'Fucsia', 'Animal Print', 'Beige', 'Marron Claro', 'Marron Oscuro',
    'Gris', 'Verde claro', 'Terracota', 'Bordeaux', 'Rojo', 'Rosa Viejo',
    'Petroleo', 'Turquesa', 'Verde militar', 'Azul', 'Verde Agua', 'Salmon',
    'Mostaza', 'Crudo', 'Combinado', 'Acero dorado'
];

// MAPEO VARIANTES (BD-BM = índices 55-64)
const VARIANTES = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10'];

// Caché de archivos para optimizar búsquedas
let archivosImagenes = null;

function cargarArchivosImagenes() {
    const carpetaImagenes = './public/imagenes';
    
    if (!existsSync(carpetaImagenes)) {
        console.log('⚠️  Carpeta /public/imagenes no existe, creándola...');
        return [];
    }
    
    try {
        const archivos = readdirSync(carpetaImagenes);
        const imagenesValidas = archivos.filter(archivo => 
            archivo.toLowerCase().endsWith('.jpg') || 
            archivo.toLowerCase().endsWith('.jpeg') || 
            archivo.toLowerCase().endsWith('.png') ||
            archivo.toLowerCase().endsWith('.webp')
        );
        
        console.log(`📁 Encontradas ${imagenesValidas.length} imágenes en /public/imagenes`);
        return imagenesValidas;
    } catch (error) {
        console.log('❌ Error leyendo carpeta de imágenes:', error.message);
        return [];
    }
}

function buscarImagenesAutomaticas(codigo) {
    if (!archivosImagenes) {
        archivosImagenes = cargarArchivosImagenes();
    }
    
    const imagenesEncontradas = [];
    const variacionesCodigo = [
        codigo,                          // Código exacto
        codigo.replace(/-/g, ''),        // Sin guiones
        codigo.replace(/-/g, ' '),       // Guiones como espacios
    ];
    
    // Buscar imágenes numeradas (1.jpg, 2.jpg, etc.)
    for (let i = 1; i <= 15; i++) {
        let encontrada = false;
        
        for (const codigoVar of variacionesCodigo) {
            const posiblesNombres = [
                `${codigoVar} ${i}.jpg`,
                `${codigoVar} ${i}.jpeg`,
                `${codigoVar} ${i}.png`,
                `${codigoVar} ${i}.webp`,
                `${codigoVar}_${i}.jpg`,
                `${codigoVar}_${i}.jpeg`,
                `${codigoVar}-${i}.jpg`,
                `${codigoVar}-${i}.jpeg`,
            ];
            
            for (const nombre of posiblesNombres) {
                if (archivosImagenes.includes(nombre)) {
                    imagenesEncontradas.push(nombre);
                    encontrada = true;
                    break;
                }
            }
            
            if (encontrada) break;
        }
    }
    
    // Buscar imagen principal sin número
    if (imagenesEncontradas.length === 0) {
        for (const codigoVar of variacionesCodigo) {
            const posiblesNombres = [
                `${codigoVar}.jpg`,
                `${codigoVar}.jpeg`,
                `${codigoVar}.png`,
                `${codigoVar}.webp`,
            ];
            
            for (const nombre of posiblesNombres) {
                if (archivosImagenes.includes(nombre)) {
                    imagenesEncontradas.push(nombre);
                    break;
                }
            }
        }
    }
    
    return imagenesEncontradas;
}

function buscarImagenVariantes(codigo) {
    if (!archivosImagenes) {
        archivosImagenes = cargarArchivosImagenes();
    }
    
    const variacionesCodigo = [
        codigo,
        codigo.replace(/-/g, ''),
        codigo.replace(/-/g, ' '),
    ];
    
    for (const codigoVar of variacionesCodigo) {
        const posiblesNombres = [
            `${codigoVar} VARIANTES.jpg`,
            `${codigoVar} VARIANTES.jpeg`,
            `${codigoVar} VARIANTES.png`,
            `${codigoVar} VARIANTES.webp`,
            `${codigoVar}_VARIANTES.jpg`,
            `${codigoVar}_VARIANTES.jpeg`,
            `${codigoVar}-VARIANTES.jpg`,
            `${codigoVar}-VARIANTES.jpeg`,
            `${codigoVar} variantes.jpg`,
            `${codigoVar} variantes.jpeg`,
            `${codigoVar}_variantes.jpg`,
            `${codigoVar}_variantes.jpeg`,
        ];
        
        for (const nombre of posiblesNombres) {
            if (archivosImagenes.includes(nombre)) {
                return nombre;
            }
        }
    }
    
    return null;
}

function convertirExcel() {
    console.log('🔄 Leyendo Excel...');
    
    try {
        const workbook = XLSX.readFile('./catalogo.xlsx');
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        const productos = [];
        let convertidos = 0;
        let errores = 0;
        let imagenesAutomaticas = 0;
        let variantesAutomaticas = 0;

        console.log(`📊 Procesando ${jsonData.length - 1} filas...`);

        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];

            // Solo productos con código
            if (!row || !row[0]) {
                continue;
            }

            try {
                const producto = {
                    codigo: String(row[0]).trim(),
                    nombre: String(row[1] || '').trim(),
                    descripcion: String(row[2] || '').trim(),
                    categoria: String(row[3] || '').trim(),
                    medidas: String(row[4] || '').trim(),
                    precio: parseFloat(row[5]) || 0,
                    estado: String(row[19] || '').trim(),
                    imagenes: [],
                    sinColor: row[17] === 'SI',
                    permitirSurtido: row[18] === 'SI',
                    colores: {},
                    variantes: {}
                };

                // PASO 1: Intentar obtener imágenes del Excel (G-P = índices 6-15)
                let imagenesDelExcel = [];
                for (let img = 6; img <= 15; img++) {
                    if (row[img] && String(row[img]).trim()) {
                        imagenesDelExcel.push(String(row[img]).trim());
                    }
                }

                // PASO 2: Si hay imágenes en Excel, usarlas. Si no, buscar automáticamente
                if (imagenesDelExcel.length > 0) {
                    producto.imagenes = imagenesDelExcel;
                    console.log(`📋 ${producto.codigo}: Usando ${imagenesDelExcel.length} imágenes del Excel`);
                } else {
                    const imagenesEncontradas = buscarImagenesAutomaticas(producto.codigo);
                    producto.imagenes = imagenesEncontradas;
                    if (imagenesEncontradas.length > 0) {
                        imagenesAutomaticas++;
                        console.log(`🔍 ${producto.codigo}: Encontradas ${imagenesEncontradas.length} imágenes automáticamente`);
                    } else {
                        console.log(`⚠️  ${producto.codigo}: No se encontraron imágenes`);
                    }
                }

                // PASO 3: Imagen de variantes (Q = índice 16)
                if (row[16] && String(row[16]).trim()) {
                    producto.imagenVariantes = String(row[16]).trim();
                    console.log(`📋 ${producto.codigo}: Usando imagen de variantes del Excel`);
                } else {
                    const variantesEncontrada = buscarImagenVariantes(producto.codigo);
                    if (variantesEncontrada) {
                        producto.imagenVariantes = variantesEncontrada;
                        variantesAutomaticas++;
                        console.log(`🔍 ${producto.codigo}: Encontrada imagen de variantes automáticamente`);
                    }
                }

                // Colores (U-BC = índices 20-54)
                for (let c = 0; c < COLORES.length; c++) {
                    if (row[20 + c] === 'SI') {
                        producto.colores[COLORES[c]] = true;
                    }
                }

                // Variantes C1-C10 (BD-BM = índices 55-64)
                for (let v = 0; v < VARIANTES.length; v++) {
                    if (row[55 + v] === 'SI') {
                        producto.variantes[VARIANTES[v]] = true;
                    }
                }

                productos.push(producto);
                convertidos++;

            } catch (error) {
                errores++;
                console.log(`❌ Error en fila ${i}: ${error.message}`);
            }
        }

        // Guardar JSON
        writeFileSync('./public/productos.json', JSON.stringify(productos, null, 2));
        
        console.log(`\n✅ CONVERSIÓN COMPLETADA:`);
        console.log(`   📦 Productos convertidos: ${convertidos}`);
        console.log(`   🔍 Imágenes encontradas automáticamente: ${imagenesAutomaticas}`);
        console.log(`   🖼️  Variantes encontradas automáticamente: ${variantesAutomaticas}`);
        console.log(`   ❌ Errores: ${errores}`);
        console.log(`   📂 Archivo generado: public/productos.json`);
        
        // Estadísticas
        const stats = {
            conImagenes: productos.filter(p => p.imagenes.length > 0).length,
            sinImagenes: productos.filter(p => p.imagenes.length === 0).length,
            conVariantesImg: productos.filter(p => p.imagenVariantes).length,
            conColores: productos.filter(p => Object.keys(p.colores).length > 0).length,
            sinColor: productos.filter(p => p.sinColor).length,
            conVariantes: productos.filter(p => Object.keys(p.variantes).length > 0).length,
            conSurtido: productos.filter(p => p.permitirSurtido).length,
            categorias: new Set(productos.map(p => p.categoria)).size
        };

        console.log(`\n📊 ESTADÍSTICAS:`);
        console.log(`   - Con imágenes: ${stats.conImagenes}`);
        console.log(`   - Sin imágenes: ${stats.sinImagenes}`);
        console.log(`   - Con imagen de variantes: ${stats.conVariantesImg}`);
        console.log(`   - Con colores: ${stats.conColores}`);
        console.log(`   - Sin color: ${stats.sinColor}`);
        console.log(`   - Con variantes C1-C10: ${stats.conVariantes}`);
        console.log(`   - Permiten surtido: ${stats.conSurtido}`);
        console.log(`   - Categorías únicas: ${stats.categorias}`);

        // Recomendaciones
        if (stats.sinImagenes > 0) {
            console.log(`\n💡 RECOMENDACIONES:`);
            console.log(`   - ${stats.sinImagenes} productos sin imágenes`);
            console.log(`   - Verifica que las imágenes estén en /public/imagenes/`);
            console.log(`   - Formatos soportados: .jpg, .jpeg, .png, .webp`);
            console.log(`   - Convenciones de nombres:`);
            console.log(`     • CODIGO 1.jpg, CODIGO 2.jpg, etc.`);
            console.log(`     • CODIGO VARIANTES.jpg`);
        }

        return productos;

    } catch (error) {
        console.error('💥 ERROR:', error.message);
        console.error('Asegúrate de que el archivo "catalogo.xlsx" esté en la raíz del proyecto.');
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    convertirExcel();
}

export default convertirExcel;
