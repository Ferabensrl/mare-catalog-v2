// convertir-excel.js - Script para convertir Excel a JSON
import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';

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

function convertirExcel() {
    console.log('🔄 Leyendo Excel...');
    
    try {
        const workbook = XLSX.readFile('./catalogo.xlsx');
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        const productos = [];
        let convertidos = 0;
        let errores = 0;

        console.log(`📊 Procesando ${jsonData.length - 1} filas...`);

        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            // Solo productos con código y estado visible
            if (!row || !row[0] || row[19] !== 'visible') {
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
                    estado: 'visible',
                    imagenes: [],
                    sinColor: row[17] === 'SI',
                    permitirSurtido: row[18] === 'SI',
                    colores: {},
                    variantes: {}
                };

                // Imágenes (G-P = índices 6-15)
                for (let img = 6; img <= 15; img++) {
                    if (row[img] && String(row[img]).trim()) {
                        producto.imagenes.push(String(row[img]).trim());
                    }
                }

                // Imagen de variantes (Q = índice 16)
                if (row[16] && String(row[16]).trim()) {
                    producto.imagenVariantes = String(row[16]).trim();
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
        console.log(`   ❌ Errores: ${errores}`);
        console.log(`   📂 Archivo generado: public/productos.json`);
        
        // Estadísticas
        const stats = {
            conColores: productos.filter(p => Object.keys(p.colores).length > 0).length,
            sinColor: productos.filter(p => p.sinColor).length,
            conVariantes: productos.filter(p => Object.keys(p.variantes).length > 0).length,
            conSurtido: productos.filter(p => p.permitirSurtido).length,
            categorias: new Set(productos.map(p => p.categoria)).size
        };

        console.log(`\n📊 ESTADÍSTICAS:`);
        console.log(`   - Con colores: ${stats.conColores}`);
        console.log(`   - Sin color: ${stats.sinColor}`);
        console.log(`   - Con variantes C1-C10: ${stats.conVariantes}`);
        console.log(`   - Permiten surtido: ${stats.conSurtido}`);
        console.log(`   - Categorías únicas: ${stats.categorias}`);

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
