const XLSX = require('xlsx');
const fs = require('fs');

// MAPEO DE COLORES (U-BC = índices 20-54)
const COLORES = [
    'Negro', 'Blanco', 'Dorado', 'Plateado', 'Acero', 'Nude', 'Tonos marrones',
    'Tonos pastel', 'Varios colores', 'Amarillo', 'Verde', 'Lila', 'Celeste',
    'Rosado', 'Fucsia', 'Animal Print', 'Beige', 'Marron Claro', 'Marron Oscuro',
    'Gris', 'Verde claro', 'Terracota', 'Bordeaux', 'Rojo', 'Rosa Viejo',
    'Petroleo', 'Turquesa', 'Verde militar', 'Azul', 'Verde Agua', 'Salmon',
    'Mostaza', 'Crudo', 'Combinado', 'Acero dorado'
];

// MAPEO DE VARIANTES (BD-BM = índices 55-64)
const VARIANTES = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10'];

console.log('🔄 Iniciando conversión completa...');

try {
    console.log('📂 Leyendo Excel...');
    const workbook = XLSX.readFile('./catalogo.xlsx');
    console.log('✅ Excel leído exitosamente');

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    console.log(`📊 Filas encontradas: ${jsonData.length}`);

    const productos = [];
    let convertidos = 0;
    let errores = 0;

    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];

        // Solo productos con código
        if (!row || !row[0]) {
            continue;
        }

        try {
            const codigo = String(row[0]).trim();

            const producto = {
                codigo: codigo,
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

            // Convertir imágenes de Drive a archivos locales (G-P = índices 6-15)
            let numeroImagen = 1;
            for (let img = 6; img <= 15; img++) {
                if (row[img] && String(row[img]).trim()) {
                    producto.imagenes.push(`${codigo} ${numeroImagen}.jpg`);
                    numeroImagen++;
                }
            }

            // Imagen variantes (Q = índice 16)
            if (row[16] && String(row[16]).trim()) {
                producto.imagenVariantes = `${codigo} VARIANTES.jpg`;
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
    fs.writeFileSync('./public/productos.json', JSON.stringify(productos, null, 2));

    console.log(`\n✅ CONVERSIÓN COMPLETADA:`);
    console.log(`   📦 Productos convertidos: ${convertidos}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📂 Archivo generado: public/productos.json`);

    // Estadísticas detalladas
    const stats = {
        conColores: productos.filter(p => Object.keys(p.colores).length > 0).length,
        sinColor: productos.filter(p => p.sinColor).length,
        conVariantes: productos.filter(p => Object.keys(p.variantes).length > 0).length,
        conSurtido: productos.filter(p => p.permitirSurtido).length,
        categorias: new Set(productos.map(p => p.categoria)).size,
        conImagenes: productos.filter(p => p.imagenes.length > 0).length,
        conImagenVariantes: productos.filter(p => p.imagenVariantes).length
    };

    console.log(`\n📊 ESTADÍSTICAS DETALLADAS:`);
    console.log(`   - Con colores: ${stats.conColores}`);
    console.log(`   - Sin color: ${stats.sinColor}`);
    console.log(`   - Con variantes C1-C10: ${stats.conVariantes}`);
    console.log(`   - Permiten surtido: ${stats.conSurtido}`);
    console.log(`   - Categorías únicas: ${stats.categorias}`);
    console.log(`   - Con imágenes: ${stats.conImagenes}`);
    console.log(`   - Con imagen de variantes: ${stats.conImagenVariantes}`);

    // Mostrar algunos ejemplos de colores más usados
    const coloresCount = {};
    productos.forEach(p => {
        Object.keys(p.colores).forEach(color => {
            coloresCount[color] = (coloresCount[color] || 0) + 1;
        });
    });

    const coloresTop = Object.entries(coloresCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

    if (coloresTop.length > 0) {
        console.log(`\n🎨 COLORES MÁS USADOS:`);
        coloresTop.forEach(([color, count]) => {
            console.log(`   - ${color}: ${count} productos`);
        });
    }

    return productos;

} catch (error) {
    console.error('💥 ERROR:', error.message);
    console.error('Asegúrate de que el archivo "catalogo.xlsx" esté en la raíz del proyecto.');
    process.exit(1);
}