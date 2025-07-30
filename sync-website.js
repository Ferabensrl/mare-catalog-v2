/**
 * Script wrapper para sincronizar el website desde el manager
 * Ejecuta el script de sincronización existente en mare-website
 */

import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function sincronizarWebsite() {
    try {
        console.log('🌐 Iniciando sincronización del website...');
        
        // Ruta al script de sincronización en mare-website
        const websitePath = 'C:\\Users\\Usuario\\mare-website';
        const syncScript = path.join(websitePath, 'sync-catalogo.js');
        
        console.log(`📁 Ejecutando: node "${syncScript}"`);
        
        // Ejecutar el script de sincronización
        const { stdout, stderr } = await execAsync(`node "${syncScript}"`, {
            cwd: websitePath,
            windowsHide: true
        });
        
        if (stdout) {
            console.log(stdout);
        }
        
        if (stderr) {
            console.error('Advertencias:', stderr);
        }
        
        console.log('✅ Sincronización completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error en sincronización:', error.message);
        process.exit(1);
    }
}

// Ejecutar cuando se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    sincronizarWebsite();
}

export { sincronizarWebsite };