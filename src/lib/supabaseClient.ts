/**
 * ============================================
 * SUPABASE CLIENT - Catálogo MARÉ
 * ============================================
 * Cliente de Supabase para envío directo de pedidos
 * Usa las MISMAS credenciales que el ERP
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURACIÓN SUPABASE
// ============================================
// IMPORTANTE: Configurar en archivo .env en la raíz del proyecto:
// VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
// VITE_SUPABASE_ANON_KEY=tu-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Faltan credenciales de Supabase en variables de entorno');
  console.error('📝 Crear archivo .env con:');
  console.error('   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co');
  console.error('   VITE_SUPABASE_ANON_KEY=tu-anon-key');
}

// Crear cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// TIPOS PARA PEDIDOS RECIBIDOS
// ============================================

/**
 * Variante de un producto (color específico con cantidad)
 */
export interface PedidoRecibidoVariante {
  color: string;         // "Negro", "Rojo", "Azul", etc.
  cantidad: number;      // Cantidad pedida de esa variante
}

/**
 * Producto completo en el pedido
 */
export interface PedidoRecibidoProducto {
  codigo: string;                      // "LB001"
  nombre: string;                      // "Cinto de dama negro"
  precio_unitario: number;             // 450
  descripcion: string;                 // Descripción del producto
  categoria: string;                   // "Accesorios"
  variantes: PedidoRecibidoVariante[]; // Array de variantes con cantidades
  surtido: number;                     // Cantidad surtida (0 si no aplica)
  comentario: string;                  // Comentario específico del producto
}

/**
 * Pedido completo que se envía a Supabase
 */
export interface PedidoRecibido {
  id?: string;                    // UUID (generado por Supabase)
  numero: string;                 // "CAT-123456" (generado en frontend)
  cliente_nombre: string;         // Nombre del cliente/vendedor
  cliente_telefono?: string;      // Teléfono (opcional)
  cliente_direccion?: string;     // Dirección (opcional)
  fecha_pedido: string;           // ISO timestamp
  estado: 'recibido';             // Estado inicial siempre 'recibido'
  origen: 'catalogo_web' | 'pdf_importado'; // Origen del pedido
  productos: PedidoRecibidoProducto[]; // Array de productos
  comentario_final?: string;      // Comentario general del pedido
  total: number;                  // Total calculado
  datos_respaldo?: any;           // JSON completo para importación desde PDF
}

// ============================================
// SERVICIO: Gestión de pedidos recibidos
// ============================================

export const pedidosRecibidosService = {
  /**
   * Insertar nuevo pedido recibido desde catálogo
   * @param pedido - Objeto con los datos del pedido
   * @returns Pedido insertado con ID generado
   */
  async insert(pedido: PedidoRecibido): Promise<PedidoRecibido> {
    console.log('📤 [Supabase] Enviando pedido:', pedido.numero);
    console.log('📊 [Supabase] Productos:', pedido.productos.length);
    console.log('💰 [Supabase] Total:', pedido.total);

    try {
      const { data, error } = await supabase
        .from('pedidos_recibidos')
        .insert([{
          numero: pedido.numero,
          cliente_nombre: pedido.cliente_nombre,
          cliente_telefono: pedido.cliente_telefono || '',
          cliente_direccion: pedido.cliente_direccion || '',
          fecha_pedido: pedido.fecha_pedido,
          estado: 'recibido',
          origen: pedido.origen || 'catalogo_web',
          productos: pedido.productos,
          comentario_final: pedido.comentario_final || '',
          total: pedido.total,
          datos_respaldo: pedido.datos_respaldo || pedido
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ [Supabase] Error insertando:', error);
        throw new Error(`Error de Supabase: ${error.message}`);
      }

      console.log('✅ [Supabase] Pedido insertado exitosamente:', data.id);
      return data as PedidoRecibido;

    } catch (error) {
      console.error('💥 [Supabase] Error crítico:', error);
      throw error;
    }
  },

  /**
   * Verificar si hay conexión a Supabase
   * @returns true si hay conexión, false si no
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 [Supabase] Verificando conexión...');

      const { error } = await supabase
        .from('pedidos_recibidos')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ [Supabase] Error de conexión:', error.message);
        return false;
      }

      console.log('✅ [Supabase] Conexión exitosa');
      return true;

    } catch (e) {
      console.error('💥 [Supabase] Error al verificar conexión:', e);
      return false;
    }
  },

  /**
   * Obtener pedidos pendientes de revisión (para debug)
   * @returns Array de pedidos en estado 'recibido'
   */
  async getPendientes(): Promise<PedidoRecibido[]> {
    try {
      const { data, error } = await supabase
        .from('pedidos_recibidos')
        .select('*')
        .eq('estado', 'recibido')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [Supabase] Error obteniendo pendientes:', error);
        return [];
      }

      return data as PedidoRecibido[];

    } catch (error) {
      console.error('💥 [Supabase] Error crítico:', error);
      return [];
    }
  },

  /**
   * Importar pedido desde JSON (para función de respaldo PDF)
   * @param datosPedido - JSON completo del pedido
   * @returns Resultado de la importación
   */
  async importarDesdeJSON(datosPedido: any): Promise<{
    success: boolean;
    pedido_id?: string;
    pedido_numero?: string;
    mensaje: string;
  }> {
    try {
      console.log('📄 [Supabase] Importando desde JSON...');

      const { data, error } = await supabase
        .rpc('importar_pedido_desde_json', {
          p_datos_pedido: datosPedido
        });

      if (error) {
        console.error('❌ [Supabase] Error en importación:', error);
        return {
          success: false,
          mensaje: `Error: ${error.message}`
        };
      }

      const resultado = Array.isArray(data) ? data[0] : data;

      if (resultado.pedido_id) {
        console.log('✅ [Supabase] Importación exitosa:', resultado.pedido_numero);
        return {
          success: true,
          pedido_id: resultado.pedido_id,
          pedido_numero: resultado.pedido_numero,
          mensaje: resultado.mensaje
        };
      } else {
        console.error('⚠️ [Supabase] Importación falló:', resultado.mensaje);
        return {
          success: false,
          mensaje: resultado.mensaje
        };
      }

    } catch (error) {
      console.error('💥 [Supabase] Error crítico en importación:', error);
      return {
        success: false,
        mensaje: `Error crítico: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }
};

// ============================================
// UTILIDADES
// ============================================

/**
 * Generar número de pedido único
 * Formato: CAT-XXXXXX (últimos 6 dígitos del timestamp)
 */
export const generarNumeroPedido = (): string => {
  const timestamp = Date.now();
  const numero = `CAT-${timestamp.toString().slice(-6)}`;
  console.log('🔢 [Utils] Número generado:', numero);
  return numero;
};

/**
 * Validar estructura de pedido antes de enviar
 * @param pedido - Pedido a validar
 * @returns true si es válido, false si no
 */
export const validarPedido = (pedido: PedidoRecibido): {
  valido: boolean;
  errores: string[];
} => {
  const errores: string[] = [];

  // Validar número
  if (!pedido.numero || pedido.numero.trim() === '') {
    errores.push('Falta número de pedido');
  }

  // Validar cliente
  if (!pedido.cliente_nombre || pedido.cliente_nombre.trim() === '') {
    errores.push('Falta nombre de cliente');
  }

  // Validar productos
  if (!pedido.productos || pedido.productos.length === 0) {
    errores.push('El pedido no tiene productos');
  }

  // Validar que cada producto tenga al menos una variante o surtido
  if (pedido.productos) {
    pedido.productos.forEach((producto, index) => {
      const tieneVariantes = producto.variantes && producto.variantes.length > 0 &&
        producto.variantes.some(v => v.cantidad > 0);
      const tieneSurtido = producto.surtido > 0;

      if (!tieneVariantes && !tieneSurtido) {
        errores.push(`Producto ${index + 1} (${producto.codigo}) no tiene cantidades`);
      }
    });
  }

  // Validar total
  if (!pedido.total || pedido.total <= 0) {
    errores.push('Total inválido o cero');
  }

  const valido = errores.length === 0;

  if (!valido) {
    console.error('❌ [Validación] Pedido inválido:', errores);
  } else {
    console.log('✅ [Validación] Pedido válido');
  }

  return { valido, errores };
};

// ============================================
// EXPORT DEFAULT
// ============================================
export default {
  supabase,
  pedidosRecibidosService,
  generarNumeroPedido,
  validarPedido
};
