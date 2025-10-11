/**
 * ============================================
 * SISTEMA DE SINCRONIZACIÓN OFFLINE
 * ============================================
 * Gestiona la cola de pedidos pendientes cuando no hay internet
 * Auto-sincroniza cuando detecta conexión
 */

import { supabase, pedidosRecibidosService, PedidoRecibido } from './supabaseClient';

// ============================================
// CONSTANTES
// ============================================

const STORAGE_KEY = 'mare_pedidos_pendientes';
const STORAGE_KEY_ERRORES = 'mare_pedidos_errores';
const RETRY_INTERVAL = 30000; // 30 segundos
const MAX_INTENTOS = 10;       // Máximo de reintentos antes de marcar como error permanente

// ============================================
// TIPOS
// ============================================

/**
 * Pedido pendiente de sincronización
 */
interface PedidoPendiente {
  id: string;                  // ID único local
  pedido: PedidoRecibido;      // Datos completos del pedido
  timestamp: number;           // Cuándo se creó
  intentos: number;            // Cantidad de reintentos
  ultimo_error?: string;       // Último mensaje de error
  ultimo_intento?: number;     // Timestamp del último intento
}

/**
 * Resultado de sincronización
 */
interface ResultadoSincronizacion {
  exitosos: number;
  fallidos: number;
  detalles: Array<{
    numero: string;
    exito: boolean;
    error?: string;
  }>;
}

// ============================================
// GESTIÓN DE COLA OFFLINE
// ============================================

/**
 * Guardar pedido en cola offline
 * Se llama cuando no hay internet o falla el envío directo
 */
export const guardarPedidoOffline = (pedido: PedidoRecibido): string => {
  console.log('💾 [Offline] Guardando pedido en cola:', pedido.numero);

  const pedidosPendientes = obtenerPedidosPendientes();

  // Verificar si ya existe (evitar duplicados)
  const yaExiste = pedidosPendientes.some(p => p.pedido.numero === pedido.numero);
  if (yaExiste) {
    console.warn('⚠️ [Offline] Pedido ya existe en cola:', pedido.numero);
    return pedidosPendientes.find(p => p.pedido.numero === pedido.numero)!.id;
  }

  const nuevoPedido: PedidoPendiente = {
    id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    pedido,
    timestamp: Date.now(),
    intentos: 0
  };

  pedidosPendientes.push(nuevoPedido);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidosPendientes));
    console.log('✅ [Offline] Pedido guardado exitosamente:', nuevoPedido.id);
    console.log('📊 [Offline] Total pendientes:', pedidosPendientes.length);
  } catch (error) {
    console.error('❌ [Offline] Error guardando en localStorage:', error);
    alert('Error al guardar pedido offline. Verifica espacio en disco.');
  }

  return nuevoPedido.id;
};

/**
 * Obtener todos los pedidos pendientes de sincronización
 */
export const obtenerPedidosPendientes = (): PedidoPendiente[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const pedidos = JSON.parse(stored) as PedidoPendiente[];
    console.log(`📋 [Offline] ${pedidos.length} pedido(s) pendiente(s)`);
    return pedidos;

  } catch (e) {
    console.error('❌ [Offline] Error leyendo pedidos pendientes:', e);
    // Si está corrupto, limpiar
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

/**
 * Eliminar pedido de la cola después de sincronizar exitosamente
 */
export const eliminarPedidoPendiente = (id: string): void => {
  const pedidos = obtenerPedidosPendientes();
  const filtrados = pedidos.filter(p => p.id !== id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados));
  console.log('🗑️ [Offline] Pedido eliminado de cola:', id);
  console.log('📊 [Offline] Total pendientes:', filtrados.length);
};

/**
 * Mover pedido a cola de errores permanentes
 */
const moverAColaErrores = (pedido: PedidoPendiente): void => {
  console.error('💥 [Offline] Moviendo a cola de errores:', pedido.pedido.numero);

  try {
    const errores = JSON.parse(localStorage.getItem(STORAGE_KEY_ERRORES) || '[]');
    errores.push({
      ...pedido,
      error_timestamp: Date.now(),
      error_mensaje: pedido.ultimo_error || 'Superó límite de reintentos'
    });

    localStorage.setItem(STORAGE_KEY_ERRORES, JSON.stringify(errores));
    console.log('📁 [Offline] Pedido archivado en errores');

  } catch (error) {
    console.error('❌ [Offline] Error guardando en cola de errores:', error);
  }
};

/**
 * Obtener pedidos con error permanente
 */
export const obtenerPedidosConError = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ERRORES);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('❌ [Offline] Error leyendo cola de errores:', e);
    return [];
  }
};

// ============================================
// SINCRONIZACIÓN
// ============================================

/**
 * Intentar sincronizar todos los pedidos pendientes
 * Se llama automáticamente cuando se detecta conexión
 */
export const sincronizarPedidosPendientes = async (): Promise<ResultadoSincronizacion> => {
  const pedidos = obtenerPedidosPendientes();

  if (pedidos.length === 0) {
    return {
      exitosos: 0,
      fallidos: 0,
      detalles: []
    };
  }

  console.log(`🔄 [Sync] Sincronizando ${pedidos.length} pedido(s) pendiente(s)...`);

  let exitosos = 0;
  let fallidos = 0;
  const detalles: Array<{ numero: string; exito: boolean; error?: string }> = [];

  for (const pedidoPendiente of pedidos) {
    try {
      console.log(`📤 [Sync] Intentando enviar: ${pedidoPendiente.pedido.numero} (intento ${pedidoPendiente.intentos + 1}/${MAX_INTENTOS})`);

      // Marcar origen como catalogo_web para mantener consistencia
      pedidoPendiente.pedido.origen = 'catalogo_web';

      // Intentar enviar a Supabase
      await pedidosRecibidosService.insert(pedidoPendiente.pedido);

      // ✅ ÉXITO
      console.log('✅ [Sync] Pedido sincronizado exitosamente:', pedidoPendiente.pedido.numero);

      // Eliminar de la cola
      eliminarPedidoPendiente(pedidoPendiente.id);

      exitosos++;
      detalles.push({
        numero: pedidoPendiente.pedido.numero,
        exito: true
      });

    } catch (error) {
      // ❌ ERROR
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`❌ [Sync] Error sincronizando ${pedidoPendiente.pedido.numero}:`, errorMsg);

      // Actualizar contador de intentos y último error
      pedidoPendiente.intentos++;
      pedidoPendiente.ultimo_error = errorMsg;
      pedidoPendiente.ultimo_intento = Date.now();

      // Si superó el límite, mover a cola de errores
      if (pedidoPendiente.intentos >= MAX_INTENTOS) {
        console.error(`💥 [Sync] Pedido ${pedidoPendiente.pedido.numero} superó ${MAX_INTENTOS} intentos`);
        moverAColaErrores(pedidoPendiente);
        eliminarPedidoPendiente(pedidoPendiente.id);
      }

      fallidos++;
      detalles.push({
        numero: pedidoPendiente.pedido.numero,
        exito: false,
        error: errorMsg
      });
    }
  }

  // Actualizar localStorage con intentos incrementados
  if (fallidos > 0) {
    const pedidosActualizados = obtenerPedidosPendientes();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidosActualizados));
  }

  console.log(`📊 [Sync] Resultado: ${exitosos} exitoso(s), ${fallidos} fallido(s)`);

  return {
    exitosos,
    fallidos,
    detalles
  };
};

// ============================================
// MONITOR DE CONEXIÓN
// ============================================

let monitorIntervalId: NodeJS.Timeout | null = null;
let monitorEventHandlers: { focus: () => void; online: () => void } | null = null;

/**
 * Verificar conexión y sincronizar si hay pedidos pendientes
 */
const verificarYSincronizar = async () => {
  // Solo intentar si hay pedidos pendientes
  const pedidos = obtenerPedidosPendientes();
  if (pedidos.length === 0) return;

  console.log('🌐 [Monitor] Verificando conexión...');

  // Verificar conexión a Supabase
  const hayConexion = await pedidosRecibidosService.testConnection();

  if (hayConexion) {
    console.log('✅ [Monitor] Conexión detectada, sincronizando...');

    const resultado = await sincronizarPedidosPendientes();

    if (resultado.exitosos > 0) {
      console.log(`🎉 [Monitor] ${resultado.exitosos} pedido(s) sincronizado(s)`);

      // Notificar al usuario si el navegador lo permite
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('Pedidos sincronizados', {
            body: `${resultado.exitosos} pedido(s) enviado(s) exitosamente al ERP`,
            icon: '/logo-mare.png',
            badge: '/logo-mare.png'
          });
        } catch (e) {
          console.log('ℹ️ [Monitor] No se pudo mostrar notificación:', e);
        }
      }
    }

    if (resultado.fallidos > 0) {
      console.warn(`⚠️ [Monitor] ${resultado.fallidos} pedido(s) con error`);
    }
  } else {
    console.log('📴 [Monitor] Sin conexión, reintentando en 30 segundos...');
  }
};

/**
 * Iniciar monitor de conexión automático
 * @returns Función de limpieza para detener el monitor
 */
export const iniciarMonitorConexion = (): (() => void) => {
  console.log('🚀 [Monitor] Iniciando monitor de conexión...');

  // Limpiar monitor anterior si existe
  if (monitorIntervalId) {
    clearInterval(monitorIntervalId);
  }

  // Verificar inmediatamente al iniciar
  verificarYSincronizar();

  // Verificar cada 30 segundos
  monitorIntervalId = setInterval(verificarYSincronizar, RETRY_INTERVAL);

  // Crear event handlers
  const handleFocus = () => {
    console.log('👁️ [Monitor] Ventana enfocada, verificando...');
    verificarYSincronizar();
  };

  const handleOnline = () => {
    console.log('🌐 [Monitor] Evento online detectado, verificando...');
    verificarYSincronizar();
  };

  monitorEventHandlers = { focus: handleFocus, online: handleOnline };

  // También verificar cuando la ventana obtiene foco
  window.addEventListener('focus', handleFocus);

  // También verificar cuando el navegador detecta conexión
  window.addEventListener('online', handleOnline);

  // Solicitar permiso para notificaciones si no se ha hecho
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('🔔 [Monitor] Permiso de notificaciones:', permission);
    });
  }

  // Retornar función de limpieza
  return () => {
    console.log('🛑 [Monitor] Deteniendo monitor...');

    if (monitorIntervalId) {
      clearInterval(monitorIntervalId);
      monitorIntervalId = null;
    }

    if (monitorEventHandlers) {
      window.removeEventListener('focus', monitorEventHandlers.focus);
      window.removeEventListener('online', monitorEventHandlers.online);
      monitorEventHandlers = null;
    }
  };
};

// ============================================
// UTILIDADES
// ============================================

/**
 * Verificar si hay internet (navegador)
 * NOTA: No es 100% confiable, solo indica si el navegador está en modo online
 */
export const hayInternet = (): boolean => {
  const online = navigator.onLine;
  console.log(`📡 [Utils] Estado del navegador: ${online ? 'Online' : 'Offline'}`);
  return online;
};

/**
 * Obtener cantidad de pedidos pendientes
 */
export const cantidadPedidosPendientes = (): number => {
  return obtenerPedidosPendientes().length;
};

/**
 * Obtener cantidad de pedidos con error
 */
export const cantidadPedidosConError = (): number => {
  return obtenerPedidosConError().length;
};

/**
 * Limpiar todos los pedidos pendientes (PELIGROSO - solo para debug)
 */
export const limpiarPedidosPendientes = (): void => {
  console.warn('⚠️ [Utils] LIMPIANDO TODOS LOS PEDIDOS PENDIENTES');
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Limpiar cola de errores
 */
export const limpiarColaErrores = (): void => {
  console.warn('⚠️ [Utils] LIMPIANDO COLA DE ERRORES');
  localStorage.removeItem(STORAGE_KEY_ERRORES);
};

/**
 * Obtener estado completo del sistema offline
 */
export const obtenerEstadoSistema = () => {
  return {
    pendientes: cantidadPedidosPendientes(),
    errores: cantidadPedidosConError(),
    online: hayInternet(),
    pedidos_pendientes: obtenerPedidosPendientes(),
    pedidos_error: obtenerPedidosConError()
  };
};

// ============================================
// EXPORT DEFAULT
// ============================================
export default {
  guardarPedidoOffline,
  obtenerPedidosPendientes,
  eliminarPedidoPendiente,
  sincronizarPedidosPendientes,
  iniciarMonitorConexion,
  hayInternet,
  cantidadPedidosPendientes,
  cantidadPedidosConError,
  obtenerEstadoSistema
};
