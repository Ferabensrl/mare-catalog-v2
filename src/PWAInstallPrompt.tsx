import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';

// Tipos para el evento de instalación PWA
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Componente principal de instalación PWA
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalado
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Escuchar evento de instalación disponible
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📱 PWA instalable detectada');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar banner después de 5 segundos (para no interrumpir la experiencia)
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 5000);
    };

    // Escuchar cuando se instala la app
    const handleAppInstalled = () => {
      console.log('🎉 PWA instalada');
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    // Escuchar cambios de conectividad
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
      // Ocultar banner offline después de 5 segundos
      setTimeout(() => setShowOfflineBanner(false), 5000);
    };

    // Agregar event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Mostrar el prompt de instalación
      await deferredPrompt.prompt();
      
      // Esperar la respuesta del usuario
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ Usuario aceptó instalar la PWA');
        setShowInstallBanner(false);
      } else {
        console.log('❌ Usuario rechazó instalar la PWA');
        // Ocultar banner por 24 horas si rechaza
        localStorage.setItem('mare-install-dismissed', Date.now().toString());
        setShowInstallBanner(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error durante la instalación:', error);
    }
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    // Recordar que se cerró por 24 horas
    localStorage.setItem('mare-install-dismissed', Date.now().toString());
  };

  // Verificar si el banner fue cerrado recientemente
  useEffect(() => {
    const dismissed = localStorage.getItem('mare-install-dismissed');
    if (dismissed) {
      const dismissTime = parseInt(dismissed);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - dismissTime < twentyFourHours) {
        setShowInstallBanner(false);
      }
    }
  }, []);

  // Banner de instalación PWA
  if (showInstallBanner && !isInstalled && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50">
        <div 
          className="rounded-xl shadow-lg p-4 border backdrop-blur-sm"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#8F6A50'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#8F6A50' }}
              >
                <Download size={16} className="text-white" />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: '#8F6A50' }}>
                Instalar MARÉ
              </h3>
            </div>
            <button
              onClick={handleDismissBanner}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>

          {/* Contenido */}
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2">
              Instala MARÉ como app para una mejor experiencia:
            </p>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Smartphone size={12} style={{ color: '#8F6A50' }} />
                <span>Acceso rápido</span>
              </div>
              <div className="flex items-center gap-1">
                <Monitor size={12} style={{ color: '#8F6A50' }} />
                <span>Pantalla completa</span>
              </div>
              <div className="flex items-center gap-1">
                <WifiOff size={12} style={{ color: '#8F6A50' }} />
                <span>Funciona offline</span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 text-white py-2 px-3 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#8F6A50' }}
            >
              Instalar App
            </button>
            <button
              onClick={handleDismissBanner}
              className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{ 
                backgroundColor: '#E3D4C1', 
                color: '#8F6A50' 
              }}
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Banner de estado offline
  if (showOfflineBanner && !isOnline) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50">
        <div className="rounded-lg shadow-lg p-3 border bg-orange-50 border-orange-200 max-w-sm mx-auto">
          <div className="flex items-center gap-3">
            <WifiOff size={20} className="text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">
                Modo Offline
              </p>
              <p className="text-xs text-orange-600">
                Funcionando con datos guardados
              </p>
            </div>
            <button
              onClick={() => setShowOfflineBanner(false)}
              className="text-orange-400 hover:text-orange-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Indicador de estado de conexión (pequeño, siempre visible)
  return (
    <div className="fixed top-4 right-4 z-40">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm border"
        style={{
          backgroundColor: isOnline ? '#10b981' : '#f59e0b',
          borderColor: isOnline ? '#059669' : '#d97706'
        }}
        title={isOnline ? 'Online' : 'Offline - Datos guardados disponibles'}
      >
        {isOnline ? (
          <Wifi size={16} className="text-white" />
        ) : (
          <WifiOff size={16} className="text-white" />
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
