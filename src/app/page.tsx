'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BANNERS = [
  {
    id: 1,
    imageDesktop: '/anuncioCamisetas.png',
    imageMobile: '/anuncioCamisetas.png',
    alt: 'Nueva Colección Portugal'
  },
  {
    id: 2,
    imageDesktop: '/anuncioPortugal.png',
    imageMobile: '/anuncioPortugal.png',
    alt: 'Camisetas Premium'
  }
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<'todos' | 'camisetas' | 'fuerza'>('todos');
  const [currentSlide, setCurrentSlide] = useState(0);

  const filteredProducts = activeCategory === 'todos' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (BANNERS.length <= 1) return;
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 antialiased selection:bg-[#002B5E] selection:text-white">
      <Navbar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative mb-12 group">
          <div className="relative w-full overflow-hidden rounded-[20px] md:rounded-[32px] bg-gray-100 shadow-sm flex items-center justify-center">
            
            <picture className="w-full">
              <source media="(min-width: 768px)" srcSet={BANNERS[0].imageDesktop} />
              <img 
                src={BANNERS[0].imageMobile} 
                alt="placeholder" 
                className="w-full h-auto max-h-[600px] object-contain opacity-0 pointer-events-none"
              />
            </picture>

            {BANNERS.map((banner, index) => (
              <div 
                key={banner.id} 
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center ${
                  currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <picture className="w-full h-full flex items-center justify-center bg-[#111111]">
                  <source media="(min-width: 768px)" srcSet={banner.imageDesktop} />
                  <img 
                    src={banner.imageMobile} 
                    alt={banner.alt} 
                    className="w-full h-full max-h-[600px] object-contain"
                  />
                </picture>
              </div>
            ))}

            {BANNERS.length > 1 && (
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-10 h-10 bg-white/90 hover:bg-white text-[#002B5E] rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {BANNERS.length > 1 && (
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-10 h-10 bg-white/90 hover:bg-white text-[#002B5E] rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {BANNERS.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {BANNERS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                      currentSlide === index 
                        ? 'bg-[#C5A059] w-8' 
                        : 'bg-white/50 hover:bg-white w-2'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

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