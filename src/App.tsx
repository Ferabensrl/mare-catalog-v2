import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Filter, X, Eye, MessageCircle, Mail, Search, Grid, List, ZoomIn, ChevronLeft, ChevronRight, Info } from 'lucide-react';

// Tipos TypeScript

// Tipos TypeScript
interface Product {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  medidas: string;
  precio: number;
  imagenes: string[];
  imagenVariantes?: string;
  sinColor: boolean;
  permitirSurtido: boolean;
  estado: string;
  colores: { [key: string]: boolean };
  variantes: { [key: string]: boolean };
}

interface CartItem {
  producto: Product;
  selecciones: { [key: string]: number };
  surtido?: number;
  comentario?: string;
}

interface LoginData {
  nombreCliente: string;
}

// Convertir enlace de Google Drive a imagen directa o manejar rutas locales
const convertGoogleDriveUrl = (url: string): string => {
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }
  // Si no es de Drive, es una ruta local, agregar /imagenes/
  if (!url.startsWith('http') && !url.startsWith('/imagenes/')) {
    return `/imagenes/${url}`;
  }
  return url;
};

// Componente de Login
const LoginScreen = ({ onLogin }: { onLogin: (data: LoginData) => void }) => {
  const [nombreCliente, setNombreCliente] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombreCliente.trim()) {
      setError('Por favor ingresa tu nombre o razón social');
      return;
    }

    onLogin({ nombreCliente: nombreCliente.trim() });
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #E3D4C1 0%, #F0E6D6 100%)' }}
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#8F6A50' }}>MARÉ</h1>
          <p style={{ color: '#8F6A50' }}>Catálogo Mayorista</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-medium mb-2" style={{ color: '#8F6A50' }}>
              Nombre o Razón Social
            </label>
            <input
              type="text"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent"
              style={{ borderColor: '#8F6A50', color: '#8F6A50' }}
              placeholder="Tu nombre o empresa"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: '#8F6A50' }}
          >
            Acceder al Catálogo
          </button>
        </form>
      </div>
    </div>
  );
};

// Componente Modal de Galería con Zoom
const ImageGalleryModal = ({ product, isOpen, onClose, initialImageIndex = 0 }: {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  initialImageIndex?: number;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setCurrentImageIndex(initialImageIndex);
  }, [initialImageIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleImageClick = (e: React.MouseEvent) => {
    if (!isZoomed) {
      setIsZoomed(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * -100;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -100;
      setZoomPosition({ x, y });
      setDragOffset({ x, y });
    }
  };

  const handleDoubleClick = () => {
    setIsZoomed(!isZoomed);
    if (!isZoomed) {
      setZoomPosition({ x: 0, y: 0 });
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isZoomed) {
      const newOffset = {
        x: Math.max(-150, Math.min(150, e.clientX - dragStart.x)),
        y: Math.max(-150, Math.min(150, e.clientY - dragStart.y))
      };
      setDragOffset(newOffset);
      setZoomPosition(newOffset);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.imagenes.length);
    setIsZoomed(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.imagenes.length) % product.imagenes.length);
    setIsZoomed(false);
    setDragOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{product.nombre}</h3>
            <p className="text-sm opacity-80">{product.codigo}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            <X size={32} />
          </button>
        </div>
      </div>

      {/* Controles de navegación */}
      {product.imagenes.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 z-10"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 z-10"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Imagen principal */}
      <div className="relative w-full h-full flex items-center justify-center p-16">
        <div 
          className="relative max-w-full max-h-full overflow-hidden cursor-zoom-in"
          style={{ cursor: isZoomed ? 'grab' : 'zoom-in' }}
        >
          <img
            src={convertGoogleDriveUrl(product.imagenes[currentImageIndex])}
            alt={`${product.nombre} - Imagen ${currentImageIndex + 1}`}
            className={`max-w-full max-h-full object-contain transition-transform duration-300 select-none ${
              isDragging ? 'cursor-grabbing' : ''
            }`}
            style={{
              transform: isZoomed 
                ? `scale(2.5) translate(${zoomPosition.x}px, ${zoomPosition.y}px)` 
                : 'scale(1)',
              transformOrigin: 'center'
            }}
            onClick={handleImageClick}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Thumbnails */}
      {product.imagenes.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 p-2 rounded-lg">
          {product.imagenes.map((imagen, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentImageIndex(index);
                setIsZoomed(false);
                setDragOffset({ x: 0, y: 0 });
              }}
              className={`w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                index === currentImageIndex 
                  ? 'border-amber-500 opacity-100' 
                  : 'border-white border-opacity-50 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={convertGoogleDriveUrl(imagen)}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OWEzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OL0E8L3RleHQ+PC9zdmc+';
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Instrucciones */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-center text-sm bg-black bg-opacity-50 px-4 py-2 rounded">
        {isZoomed ? (
          <p>Arrastra para mover • Doble clic para alejar</p>
        ) : (
          <p>Clic para hacer zoom • Doble clic para alejar</p>
        )}
      </div>
    </div>
  );
};

// Componente de tarjeta de producto MEJORADO
const ProductCard = ({ product, onAddToCart, viewMode }: {
  product: Product;
  onAddToCart: (producto: Product, selecciones: { [key: string]: number }, surtido?: number, comentario?: string) => void;
  viewMode: 'grid' | 'list';
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selecciones, setSelecciones] = useState<{ [key: string]: number }>({});
  const [surtido, setSurtido] = useState(0);
  const [comentario, setComentario] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVariantesModal, setShowVariantesModal] = useState(false);

  // Obtener opciones disponibles (colores o variantes)
  const getAvailableOptions = () => {
    const hasVariantes = Object.values(product.variantes).some(v => v);
    if (hasVariantes) {
      return Object.keys(product.variantes).filter(key => product.variantes[key]);
    }
    return Object.keys(product.colores).filter(key => product.colores[key]);
  };

  const availableOptions = getAvailableOptions();

  const handleQuantityChange = (option: string, change: number) => {
    setSelecciones(prev => ({
      ...prev,
      [option]: Math.max(0, (prev[option] || 0) + change)
    }));
  };

  const handleDirectQuantityChange = (option: string, value: string) => {
    const num = parseInt(value) || 0;
    setSelecciones(prev => ({
      ...prev,
      [option]: Math.max(0, num)
    }));
  };

  const handleAddToCart = () => {
    const hasQuantities = Object.values(selecciones).some(q => q > 0) || surtido > 0;
    if (hasQuantities) {
      onAddToCart(product, selecciones, surtido, comentario);
      // Limpiar formulario después de agregar
      setSelecciones({});
      setSurtido(0);
      setComentario('');
    }
  };

  // Funciones para navegación del carrusel
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % product.imagenes.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + product.imagenes.length) % product.imagenes.length);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow ${
      viewMode === 'list' ? 'flex' : ''
    }`}>
      {/* Imágenes con carrusel mejorado */}
      <div className="relative group">
        <div 
          className={`${viewMode === 'grid' ? 'aspect-square' : 'aspect-video w-64'} bg-stone-100 rounded-lg overflow-hidden cursor-pointer relative`}
          onClick={() => setShowImageModal(true)}
        >
          <img
            src={convertGoogleDriveUrl(product.imagenes[currentImageIndex])}
            alt={product.nombre}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
          
          {/* Overlay de zoom */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={32} />
          </div>

          {/* Flechas de navegación - MEJORADAS PARA MÓVIL */}
          {product.imagenes.length > 1 && (
            <>
              {/* Flecha izquierda */}
              <button
                onClick={prevImage}
                className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 sm:p-2 rounded-full opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-opacity-80 transition-all duration-300 z-10 touch-manipulation"
              >
                <ChevronLeft size={24} className="sm:hidden" />
                <ChevronLeft size={20} className="hidden sm:block" />
              </button>
              
              {/* Flecha derecha */}
              <button
                onClick={nextImage}
                className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 sm:p-2 rounded-full opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-opacity-80 transition-all duration-300 z-10 touch-manipulation"
              >
                <ChevronRight size={24} className="sm:hidden" />
                <ChevronRight size={20} className="hidden sm:block" />
              </button>
            </>
          )}
        </div>
        
        {/* Indicadores de navegación mejorados */}
        {product.imagenes.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {product.imagenes.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4 space-y-3 flex-1">
        <div>
          <h3 className="font-semibold" style={{ color: '#8F6A50' }}>{product.nombre}</h3>
          <p className="text-sm opacity-80" style={{ color: '#8F6A50' }}>{product.codigo}</p>
          <p className="text-lg font-bold" style={{ color: '#8F6A50' }}>${product.precio}</p>
        </div>

        {/* Imagen de variantes MEJORADA Y MÁS GRANDE */}
        {product.imagenVariantes && (
          <div className="border rounded-lg overflow-hidden bg-gray-50">
            <div className="p-3">
              <p className="text-xs font-medium mb-3" style={{ color: '#8F6A50' }}>Variantes disponibles:</p>
              <div 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowVariantesModal(true)}
              >
                <img
                  src={convertGoogleDriveUrl(product.imagenVariantes)}
                  alt="Variantes disponibles"
                  className="w-full h-32 sm:h-36 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <p className="text-xs text-center mt-2 opacity-70" style={{ color: '#8F6A50' }}>
                👆 Clic para ver en grande
              </p>
            </div>
          </div>
        )}

        {/* Selección de opciones */}
        {product.sinColor ? (
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: '#8F6A50' }}>Cantidad</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange('sinColor', -1)}
                className="p-1 rounded"
                style={{ backgroundColor: '#E3D4C1', color: '#8F6A50' }}
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={selecciones['sinColor'] || 0}
                onChange={(e) => handleDirectQuantityChange('sinColor', e.target.value)}
                className="w-16 text-center border rounded px-2 py-1"
                style={{ borderColor: '#8F6A50', color: '#8F6A50' }}
                min="0"
              />
              <button
                onClick={() => handleQuantityChange('sinColor', 1)}
                className="p-1 rounded"
                style={{ backgroundColor: '#E3D4C1', color: '#8F6A50' }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Opciones de colores/variantes */}
            {availableOptions.map(option => (
              <div key={option} className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: '#8F6A50' }}>{option}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(option, -1)}
                    className="p-1 rounded"
                    style={{ backgroundColor: '#E3D4C1', color: '#8F6A50' }}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={selecciones[option] || 0}
                    onChange={(e) => handleDirectQuantityChange(option, e.target.value)}
                    className="w-16 text-center border rounded px-2 py-1"
                    style={{ borderColor: '#8F6A50', color: '#8F6A50' }}
                    min="0"
                  />
                  <button
                    onClick={() => handleQuantityChange(option, 1)}
                    className="p-1 rounded"
                    style={{ backgroundColor: '#E3D4C1', color: '#8F6A50' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Opción de surtido */}
            {product.permitirSurtido && (
              <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: '#E3D4C1' }}>
                <span className="text-sm font-medium" style={{ color: '#8F6A50' }}>Surtido</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSurtido(Math.max(0, surtido - 1))}
                    className="p-1 rounded"
                    style={{ backgroundColor: '#8F6A50', color: 'white' }}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={surtido}
                    onChange={(e) => setSurtido(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 text-center border rounded px-2 py-1"
                    style={{ borderColor: '#8F6A50', color: '#8F6A50' }}
                    min="0"
                  />
                  <button
                    onClick={() => setSurtido(surtido + 1)}
                    className="p-1 rounded"
                    style={{ backgroundColor: '#8F6A50', color: 'white' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Campo de comentario del producto */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: '#8F6A50' }}>
            Comentario para este producto
          </label>
          <textarea
            placeholder="Ej: Con cartones, sin flecos, etc..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:border-transparent"
            style={{ borderColor: '#8F6A50', color: '#8F6A50' }}
            rows={2}
          />
        </div>

        {/* Botón agregar al pedido */}
        <button
          onClick={handleAddToCart}
          disabled={!Object.values(selecciones).some(q => q > 0) && surtido === 0}
          className="w-full text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ backgroundColor: '#8F6A50' }}
        >
          {Object.values(selecciones).some(q => q > 0) || surtido > 0 
            ? `Agregar al Pedido (${Object.values(selecciones).reduce((sum, qty) => sum + qty, 0) + surtido} unidades)`
            : 'Agregar al Pedido'
          }
        </button>

        {/* Botón ver detalles */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center gap-2 py-1"
          style={{ color: '#8F6A50' }}
        >
          <Eye size={16} />
          Ver detalles
        </button>

        {/* Detalles expandibles */}
        {showDetails && (
          <div className="border-t pt-3 space-y-1 text-sm" style={{ borderColor: '#E3D4C1', color: '#8F6A50' }}>
            <p><strong>Descripción:</strong> {product.descripcion}</p>
            <p><strong>Medidas:</strong> {product.medidas}</p>
            <p><strong>Categoría:</strong> {product.categoria}</p>
          </div>
        )}
      </div>
      
      {/* Modal de galería de imágenes */}
      <ImageGalleryModal
        product={product}
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        initialImageIndex={currentImageIndex}
      />

      {/* Modal de imagen de variantes */}
      {product.imagenVariantes && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 transition-opacity ${
            showVariantesModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setShowVariantesModal(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowVariantesModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
            >
              <X size={32} />
            </button>
            <img
              src={convertGoogleDriveUrl(product.imagenVariantes)}
              alt="Variantes disponibles"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Modal del carrito - OPTIMIZADO PARA MÓVIL
const CartModal = ({ cart, onClose, onRemoveItem, onUpdateComment, onGenerateWhatsApp, onClearCart, onConfirmClearCart, totalPrice, clientName }: {
  cart: CartItem[];
  onClose: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateComment: (index: number, comentario: string) => void;
  onGenerateWhatsApp: (comentarioFinal: string) => string;
  onClearCart: () => void;
  onConfirmClearCart?: () => void;
  totalPrice: number;
  clientName: string;
}) => {
  const [comentarioFinal, setComentarioFinal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleWhatsAppSend = async () => {
    setIsLoading(true);
    const message = onGenerateWhatsApp(comentarioFinal);
    
    // Abrir WhatsApp
    window.open(`https://wa.me/?text=${message}`, '_blank');
    
    // Mostrar mensaje de confirmación y resetear después de un momento
    setTimeout(() => {
      setIsLoading(false);
      onClearCart(); // Limpiar el carrito
      onClose(); // Cerrar el modal
      
      // Mostrar notificación de éxito
      alert('¡Pedido enviado por WhatsApp! 🎉\n\nLa aplicación se ha reiniciado para un nuevo pedido.');
    }, 1500);
  };

  const handleEmailSend = async () => {
    setIsLoading(true);
    const subject = `Nuevo Pedido - ${clientName}`;
    const body = decodeURIComponent(onGenerateWhatsApp(comentarioFinal));
    
    // Abrir cliente de email
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    
    // Mostrar mensaje de confirmación y resetear después de un momento
    setTimeout(() => {
      setIsLoading(false);
      onClearCart(); // Limpiar el carrito
      onClose(); // Cerrar el modal
      
      // Mostrar notificación de éxito
      alert('¡Pedido enviado por Email! 📧\n\nLa aplicación se ha reiniciado para un nuevo pedido.');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header fijo */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-white sticky top-0 z-10">
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#8F6A50' }}>Tu Pedido</h2>
          <div className="flex items-center gap-2">
            {/* Botón Limpiar Pedido en el modal */}
            {cart.length > 0 && onConfirmClearCart && (
              <button
                onClick={onConfirmClearCart}
                className="px-3 py-1 rounded text-xs font-medium hover:opacity-80 transition-all"
                style={{ backgroundColor: '#f87171', color: 'white' }}
                disabled={isLoading}
                title="Limpiar todo el pedido"
              >
                🧹 Limpiar
              </button>
            )}
            <button onClick={onClose} className="hover:opacity-70" style={{ color: '#8F6A50' }}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Total fijo en móvil - aparece arriba */}
        {cart.length > 0 && (
          <div className="sm:hidden bg-white border-b p-4 sticky top-16 z-10">
            <div className="flex justify-between items-center text-lg font-bold">
              <span style={{ color: '#8F6A50' }}>Total:</span>
              <span style={{ color: '#8F6A50' }}>${totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Contenido del carrito - scrolleable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg mb-4" style={{ color: '#8F6A50' }}>Tu pedido está vacío</p>
                <p className="text-sm opacity-70" style={{ color: '#8F6A50' }}>
                  💾 Los productos que agregues se guardan automáticamente
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={index} className="border rounded-lg p-3 sm:p-4" style={{ borderColor: '#E3D4C1' }}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-2">
                        <h3 className="font-semibold text-sm sm:text-base" style={{ color: '#8F6A50' }}>{item.producto.nombre}</h3>
                        <p className="text-xs sm:text-sm opacity-80" style={{ color: '#8F6A50' }}>{item.producto.codigo}</p>
                        <p className="text-sm font-medium" style={{ color: '#8F6A50' }}>${item.producto.precio}</p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        disabled={isLoading}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Selecciones */}
                    <div className="space-y-1 mb-3">
                      {Object.entries(item.selecciones).map(([opcion, cantidad]) => (
                        cantidad > 0 && (
                          <div key={opcion} className="flex justify-between text-xs sm:text-sm">
                            <span>{opcion}:</span>
                            <span className="font-medium">{cantidad}</span>
                          </div>
                        )
                      ))}
                      {item.surtido && item.surtido > 0 && (
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Surtido:</span>
                          <span className="font-medium">{item.surtido}</span>
                        </div>
                      )}
                    </div>

                    {/* Campo de comentario */}
                    <textarea
                      placeholder="Comentario para este producto..."
                      value={item.comentario || ''}
                      onChange={(e) => onUpdateComment(index, e.target.value)}
                      className="w-full border rounded px-2 sm:px-3 py-2 text-xs sm:text-sm resize-none"
                      style={{ borderColor: '#8F6A50', color: '#8F6A50' }}
                      rows={2}
                      disabled={isLoading}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer fijo - siempre visible */}
        {cart.length > 0 && (
          <div className="border-t bg-white p-4 sm:p-6 space-y-3 sm:space-y-4 sticky bottom-0">
            {/* Comentario final */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: '#8F6A50' }}>
                Comentario final del pedido
              </label>
              <textarea
                placeholder="Observaciones generales del pedido..."
                value={comentarioFinal}
                onChange={(e) => setComentarioFinal(e.target.value)}
                className="w-full border rounded px-2 sm:px-3 py-2 text-xs sm:text-sm resize-none"
                style={{ borderColor: '#8F6A50', color: '#8F6A50' }}
                rows={2}
                disabled={isLoading}
              />
            </div>

            {/* Total en desktop */}
            <div className="hidden sm:flex justify-between items-center text-lg font-bold">
              <span style={{ color: '#8F6A50' }}>Total:</span>
              <span style={{ color: '#8F6A50' }}>${totalPrice.toLocaleString()}</span>
            </div>

            {/* Mensaje de estado de envío */}
            {isLoading && (
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-700 font-medium text-sm">
                  📤 Enviando pedido... ¡Por favor espera!
                </p>
              </div>
            )}

            {/* Botones de envío - siempre visibles */}
            <div className="flex flex-col gap-2 sm:gap-3">
              <button
                onClick={handleWhatsAppSend}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 sm:py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <MessageCircle size={18} />
                {isLoading ? 'Enviando...' : 'Enviar por WhatsApp'}
              </button>
              <button
                onClick={handleEmailSend}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 sm:py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Mail size={18} />
                {isLoading ? 'Enviando...' : 'Enviar por Email'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente principal de la aplicación
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState<LoginData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [promoMessage, setPromoMessage] = useState('');

  // 💾 PERSISTENCIA DEL CARRITO - Cargar al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('mare-cart');
    const savedLoginData = localStorage.getItem('mare-login');
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error cargando carrito guardado:', error);
        localStorage.removeItem('mare-cart');
      }
    }
    
    if (savedLoginData) {
      try {
        const parsedLogin = JSON.parse(savedLoginData);
        setLoginData(parsedLogin);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error cargando login guardado:', error);
        localStorage.removeItem('mare-login');
      }
    }
  }, []);

  // 💾 PERSISTENCIA DEL CARRITO - Guardar cuando cambia
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('mare-cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('mare-cart');
    }
  }, [cart]);

  // 💾 PERSISTENCIA DEL LOGIN - Guardar cuando cambia
  useEffect(() => {
    if (loginData) {
      localStorage.setItem('mare-login', JSON.stringify(loginData));
    }
  }, [loginData]);

  // Cargar mensaje promocional
  useEffect(() => {
    const loadMessage = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}mensaje.json`);
        if (!response.ok) return;
        const data = await response.json();
        if (data.mensaje_portada) {
          setPromoMessage(data.mensaje_portada);
        }
      } catch (error) {
        console.error('Error cargando mensaje promocional:', error);
      }
    };
    loadMessage();
  }, []);

  // Cargar productos reales desde JSON
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        // Cargar productos reales desde JSON
        const response = await fetch(`${import.meta.env.BASE_URL}productos.json`);
        const productosReales = await response.json();

        setProducts(productosReales);
        setFilteredProducts(productosReales);
        
        // Extraer categorías únicas
        const uniqueCategories: string[] = Array.from(new Set(productosReales.map((p: Product) => p.categoria)));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filtrar productos
  useEffect(() => {
    let filtered = products.filter(product => product.estado === 'visible');
    
    if (selectedCategory !== 'todas') {
      filtered = filtered.filter(product => product.categoria === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  const handleLogin = (data: LoginData) => {
    setLoginData(data);
    setIsLoggedIn(true);
  };

  const addToCart = (producto: Product, selecciones: { [key: string]: number }, surtido?: number, comentario?: string) => {
    const existingItemIndex = cart.findIndex(item => 
      item.producto.codigo === producto.codigo &&
      JSON.stringify(item.selecciones) === JSON.stringify(selecciones) &&
      item.comentario === comentario
    );

    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      Object.keys(selecciones).forEach(key => {
        newCart[existingItemIndex].selecciones[key] = 
          (newCart[existingItemIndex].selecciones[key] || 0) + selecciones[key];
      });
      if (surtido) {
        newCart[existingItemIndex].surtido = (newCart[existingItemIndex].surtido || 0) + surtido;
      }
      setCart(newCart);
    } else {
      setCart([...cart, { producto, selecciones, surtido, comentario }]);
    }
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateCartItemComment = (index: number, comentario: string) => {
    const newCart = [...cart];
    newCart[index].comentario = comentario;
    setCart(newCart);
  };

  // 🧹 FUNCIÓN PARA LIMPIAR TODO EL CARRITO CON CONFIRMACIÓN
  const confirmClearCart = () => {
    if (cart.length === 0) {
      alert('El carrito ya está vacío.');
      return;
    }
    
    const confirmed = window.confirm(
      `⚠️ ¿Estás seguro que quieres limpiar todo el pedido?\n\n` +
      `Se perderán ${getTotalItems()} productos del carrito.\n\n` +
      `Esta acción no se puede deshacer.`
    );
    
    if (confirmed) {
      setCart([]);
      setShowCart(false);
      alert('🧹 Pedido limpiado correctamente.\n\n¡Puedes empezar un nuevo pedido!');
    }
  };

  // Nueva función para limpiar todo el carrito (sin confirmación, para después de enviar)
  const clearCart = () => {
    setCart([]);
  };

  // 🚪 FUNCIÓN PARA CERRAR SESIÓN
  const handleLogout = () => {
    const confirmed = window.confirm(
      `¿Estás seguro que quieres cerrar sesión?\n\n` +
      `${cart.length > 0 ? `⚠️ ATENCIÓN: Tienes ${getTotalItems()} productos en el carrito.\nSe guardarán automáticamente para cuando vuelvas a iniciar sesión.` : 'Tu sesión se cerrará completamente.'}`
    );
    
    if (confirmed) {
      localStorage.removeItem('mare-login');
      setIsLoggedIn(false);
      setLoginData(null);
      // NO limpiamos el carrito - se mantiene guardado
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => {
      const itemTotal = Object.values(item.selecciones).reduce((sum, qty) => sum + qty, 0) + (item.surtido || 0);
      return total + itemTotal;
    }, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const itemTotal = Object.values(item.selecciones).reduce((sum, qty) => sum + qty, 0) + (item.surtido || 0);
      return total + (itemTotal * item.producto.precio);
    }, 0);
  };

  const generateWhatsAppMessage = (comentarioFinal: string = '') => {
    const fecha = new Date().toLocaleDateString('es-AR');
    let mensaje = `📲 NUEVO PEDIDO – ${fecha}\n👤 Cliente: ${loginData?.nombreCliente}\n\n📦 *Detalle del pedido:*\n\n`;

    cart.forEach(item => {
      mensaje += `🔹 ${item.producto.codigo}\n`;
      
      Object.entries(item.selecciones).forEach(([opcion, cantidad]) => {
        if (cantidad > 0) {
          mensaje += `- ${opcion}: ${cantidad}\n`;
        }
      });
      
      if (item.surtido && item.surtido > 0) {
        mensaje += `- Surtido: ${item.surtido}\n`;
      }
      
      mensaje += `📝 Comentario: ${item.comentario || ''}\n\n`;
    });

    if (comentarioFinal) {
      mensaje += `✍️ *Comentario final:* ${comentarioFinal}\n\n`;
    }

    mensaje += `🥳 ¡Gracias por tu pedido y por elegirnos! 🙌🏻`;
    
    return encodeURIComponent(mensaje);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E3D4C1' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold" style={{ color: '#8F6A50' }}>MARÉ</h1>
              {loginData && (
                <div className="hidden sm:block">
                  <p className="text-sm" style={{ color: '#8F6A50' }}>
                    👤 {loginData.nombreCliente}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Botón Limpiar Pedido */}
              {cart.length > 0 && (
                <button
                  onClick={confirmClearCart}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-all"
                  style={{ backgroundColor: '#f87171', color: 'white' }}
                  title="Limpiar todo el pedido"
                >
                  🧹 Limpiar
                </button>
              )}
              
              {/* Carrito flotante */}
              <button
                onClick={() => setShowCart(true)}
                className="relative text-white p-3 rounded-full hover:opacity-90 transition-all"
                style={{ backgroundColor: '#8F6A50' }}
                title="Ver tu pedido"
              >
                <ShoppingCart size={24} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
              
              {/* Botón Cerrar Sesión */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-all"
                style={{ backgroundColor: '#6b7280', color: 'white' }}
                title="Cerrar sesión"
              >
                🚪 Salir
              </button>
            </div>
          </div>
          
          {/* Info del usuario en móvil */}
          {loginData && (
            <div className="sm:hidden mt-2 flex items-center justify-between">
              <p className="text-sm" style={{ color: '#8F6A50' }}>
                👤 {loginData.nombreCliente}
              </p>
              <div className="flex gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={confirmClearCart}
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: '#f87171', color: 'white' }}
                  >
                    🧹 Limpiar
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: '#6b7280', color: 'white' }}
                >
                  🚪 Salir
                </button>
              </div>
            </div>
          )}
          
          {/* Barra de búsqueda y filtros */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#8F6A50' }} size={20} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                style={{ borderColor: '#8F6A50', color: '#8F6A50' }}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                style={{ 
                  backgroundColor: showFilters ? '#8F6A50' : '#E3D4C1',
                  color: showFilters ? 'white' : '#8F6A50'
                }}
              >
                <Filter size={20} />
                Filtros
              </button>
              
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#E3D4C1', color: '#8F6A50' }}
              >
                {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
              </button>
            </div>
          </div>
          
          {/* Filtros de categoría */}
          {showFilters && (
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#E3D4C1' }}>
              <h3 className="font-medium mb-3" style={{ color: '#8F6A50' }}>Categorías</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('todas')}
                  className="px-3 py-1 rounded-full text-sm transition-colors"
                  style={{
                    backgroundColor: selectedCategory === 'todas' ? '#8F6A50' : 'white',
                    color: selectedCategory === 'todas' ? 'white' : '#8F6A50'
                  }}
                >
                  Todas
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="px-3 py-1 rounded-full text-sm transition-colors"
                    style={{
                      backgroundColor: selectedCategory === category ? '#8F6A50' : 'white',
                      color: selectedCategory === category ? 'white' : '#8F6A50'
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Indicador de carrito guardado */}
          {cart.length > 0 && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 text-center">
                💾 Pedido guardado automáticamente • {getTotalItems()} productos • ${getTotalPrice().toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </header>

      {promoMessage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 flex items-center justify-center gap-2">
          <Info size={18} />
          <span>{promoMessage}</span>
        </div>
      )}

      {/* Grid de productos */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: '#8F6A50' }}>Cargando productos...</p>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.codigo} 
                  product={product} 
                  onAddToCart={addToCart}
                  viewMode={viewMode}
                />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg" style={{ color: '#8F6A50' }}>No se encontraron productos</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal del carrito */}
      {showCart && (
        <CartModal
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemoveItem={removeFromCart}
          onUpdateComment={updateCartItemComment}
          onGenerateWhatsApp={generateWhatsAppMessage}
          onClearCart={clearCart}
          onConfirmClearCart={confirmClearCart}
          totalPrice={getTotalPrice()}
          clientName={loginData?.nombreCliente || ''}
        />
      )}
    </div>
  );
};

export default App;
