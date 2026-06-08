'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<'todos' | 'camisetas' | 'fuerza'>('todos');

  const filteredProducts = activeCategory === 'todos' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 antialiased selection:bg-[#002B5E] selection:text-white">
      <Navbar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner Estilo Tienda Oficial */}
        <div className="text-center py-12 mb-10 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#002B5E]/5 to-[#C5A059]/5" />
          <div className="relative z-10 px-4">
            <h1 className="text-3xl font-black tracking-tight text-[#002B5E] sm:text-4xl md:text-5xl uppercase">
              Tienda <span className="text-[#C5A059]">Oficial</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-gray-600 font-medium">
              Camisetas exclusivas y equipamiento de fuerza. Navega por nuestro catálogo y coordina tu compra de forma segura y directa a nuestro WhatsApp.
            </p>
          </div>
        </div>

        {/* Grid de Productos */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 font-medium">
            No se encontraron productos en esta categoría.
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white py-8 text-center text-xs font-medium text-gray-500 mt-20">
        &copy; {new Date().getFullYear()} SportsStore. Desarrollado por Z-INDEX STUDIO.
      </footer>
    </div>
  );
}