'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
// Usamos el alias @/ para evitar conflictos de rutas
import { products } from '@/data/products';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { ArrowLeft, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/store/cartStore';
import { useRouter } from 'next/navigation';

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = products.find(p => p.id === id);
  const router = useRouter();
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isAdded, setIsAdded] = useState(false); 
  const [showError, setShowError] = useState(false); // Nuevo estado para el error de talla
  
  const { addToCart } = useCart();

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-[#002B5E]">Producto no encontrado</div>;
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    // Verificamos si falta la talla
    if (product.sizes && !selectedSize) {
      setShowError(true); // Mostramos el mensaje de error visual
      return;
    }
    
    setShowError(false); // Ocultamos el error por si estaba activo
    addToCart(product, selectedSize);

    // Activamos la animación visual de "Agregado"
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000); // Vuelve a la normalidad después de 2 segundos
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 antialiased">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 bg-white mt-8 shadow-sm rounded-lg">
        <div className="mb-4 pt-4">
          {/* CAMBIAMOS Link POR button */}
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#002B5E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4 pb-16">
          <div className="flex justify-center items-center bg-white p-8">
            <img src={product.image} alt={product.name} className="max-w-full h-auto max-h-[500px] object-contain" />
          </div>

          <div className="flex flex-col justify-start pt-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl font-bold text-red-600">S/ {product.price.toFixed(2)}</span>
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                Precio Web
              </span>
            </div>

            {product.sizes && (
              <div className="mb-8 border-b border-gray-300 pb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Tallas</label>
                <select 
                  className={`w-full border rounded-md p-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#002B5E] transition-colors ${
                    showError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  value={selectedSize}
                  onChange={(e) => {
                    setSelectedSize(e.target.value);
                    setShowError(false); // Oculta el error automáticamente al elegir talla
                  }}
                >
                  <option value="" disabled>Seleccionar</option>
                  {product.sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>

                {/* MENSAJE DE ERROR ELEGANTE */}
                {showError && (
                  <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
                    Por favor, selecciona una talla
                  </p>
                )}
              </div>
            )}

            {/* BOTÓN CON LÓGICA VISUAL */}
            <button
              onClick={handleAddToCart}
              disabled={isAdded} // Deshabilita el botón mientras dice "Agregado"
              className={`flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 rounded text-sm font-bold text-white transition-all shadow-sm ${
                (product.sizes && !selectedSize) 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : isAdded
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-[#8B8970] hover:bg-[#72705b]'
              }`}
            >
              {isAdded ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
              {isAdded ? '¡Agregado al carrito!' : 'Agregar al carrito'}
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 py-12 bg-[#F1F3F6] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 uppercase tracking-widest mb-6">Detalles del Producto</h2>
          <p className="max-w-4xl mx-auto text-center text-gray-600 font-medium">{product.description}</p>
        </div>

        {relatedProducts.length > 0 && (
          <div className="py-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 uppercase tracking-widest mb-10">Completa tu indumentaria</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}