'use client';

import React, { useState, use } from 'react';
import Link from 'next/link'; // Importamos Link
import { products } from '../../../data/products';
import Navbar from '../../../components/Navbar';
import ProductCard from '../../../components/ProductCard';
import { MessageCircle, ArrowLeft } from 'lucide-react'; // Agregamos ArrowLeft

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState<string>('');

  // ... (aquí mantienes tus funciones if(!product), relatedProducts y handleWhatsAppRedirect igualitas) ...
  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-[#002B5E]">Producto no encontrado</div>;
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const WHATSAPP_NUMBER = '51923469044'; 

  const handleWhatsAppRedirect = () => {
    if (product.sizes && !selectedSize) {
      alert("Por favor, selecciona una talla antes de continuar.");
      return;
    }

    const tallaText = selectedSize ? `\n📏 *Talla:* ${selectedSize}` : '';
    const message = `¡Hola! Quiero comprar este producto:\n\n` +
                    `📦 *Producto:* ${product.name}\n` +
                    `🔢 *SKU:* ${product.sku}${tallaText}\n` +
                    `💰 *Precio:* S/ ${product.price.toFixed(2)}\n\n`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${51923469044}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 antialiased">
      <Navbar activeCategory="" setActiveCategory={() => {}} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 bg-white mt-8 shadow-sm rounded-lg">
        
        {/* BOTÓN DE VOLVER */}
        <div className="mb-4 pt-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#002B5E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </Link>
        </div>

        {/* Sección Superior: Imagen y Compra */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4 pb-16">
          {/* Columna Izquierda: Imagen */}
          <div className="flex justify-center items-center bg-white p-8">
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-w-full h-auto max-h-[500px] object-contain"
            />
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
                  className="w-full border border-gray-300 rounded-md p-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#002B5E]"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  <option value="" disabled>Seleccionar</option>
                  {product.sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleWhatsAppRedirect}
              className={`flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 rounded text-sm font-bold text-white transition-all shadow-sm ${
                (product.sizes && !selectedSize) 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#8B8970] hover:bg-[#72705b]'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              Seleccionar opciones (WhatsApp)
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 py-12 bg-[#F1F3F6] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 uppercase tracking-widest mb-6">
            Detalles del Producto
          </h2>
          <p className="max-w-4xl mx-auto text-center text-gray-600 font-medium">
            {product.description}
          </p>
        </div>

        {relatedProducts.length > 0 && (
          <div className="py-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 uppercase tracking-widest mb-10">
              Completa tu indumentaria
            </h2>
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