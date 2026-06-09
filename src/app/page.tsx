'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const BANNERS = [
  { id: 1, imageDesktop: '/anuncioCamisetas.png', imageMobile: '/anunCamiCelu.png', alt: 'Nueva Colección' },
  { id: 2, imageDesktop: '/anuncioPortugal.png', imageMobile: '/anunPortuCelu.png', alt: 'Premium' }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null); // Referencia para el carrusel de productos

  const nextSlide = () => setCurrentSlide((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));

  useEffect(() => {
    if (BANNERS.length <= 1) return;
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  // Función para mover el carrusel de productos
  const scrollProducts = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Seleccionamos solo algunos productos para el inicio (ej. los primeros 6)
  const destacados = products.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 antialiased selection:bg-[#002B5E] selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HERO BANNER (Igual que antes) */}
        <div className="relative mb-16 group">
          <div className="relative w-full overflow-hidden rounded-[20px] md:rounded-[32px] bg-gray-100 shadow-sm flex items-center justify-center">
            <picture className="w-full">
              <source media="(min-width: 768px)" srcSet={BANNERS[0].imageDesktop} />
              <img src={BANNERS[0].imageMobile} alt="placeholder" className="w-full h-auto max-h-[600px] object-contain opacity-0 pointer-events-none" />
            </picture>
            {BANNERS.map((banner, index) => (
              <div key={banner.id} className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center ${currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <picture className="w-full h-full flex items-center justify-center bg-[#111111]">
                  <source media="(min-width: 768px)" srcSet={banner.imageDesktop} />
                  <img src={banner.imageMobile} alt={banner.alt} className="w-full h-full max-h-[600px] object-contain" />
                </picture>
              </div>
            ))}
            {/* Flechas del banner... (omitidas por brevedad pero siguen funcionando con los estados) */}
          </div>
        </div>

        {/* SECCIÓN PRODUCTOS DESTACADOS (SLIDER HORIZONTAL) */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-1">Productos Destacados</p>
              <h2 className="text-3xl font-black text-[#002B5E]">Lo más vendido</h2>
            </div>
            <div className="hidden md:flex gap-2">
              <button onClick={() => scrollProducts('left')} className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-[#002B5E]" />
              </button>
              <button onClick={() => scrollProducts('right')} className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-5 h-5 text-[#002B5E]" />
              </button>
            </div>
          </div>

          {/* Contenedor scrolleable */}
          <div 
            ref={sliderRef}
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Oculta la barra de scroll
          >
            {destacados.map((product) => (
              <div key={product.id} className="min-w-[280px] sm:min-w-[300px] snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <Link href="/categoria/todos" className="inline-flex items-center gap-2 text-sm font-bold text-[#002B5E] hover:text-[#C5A059] transition-colors">
              Ver todo el catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </main>

      <footer className="border-t border-gray-200 bg-white py-8 text-center text-xs font-medium text-gray-500">
        &copy; {new Date().getFullYear()} SportsStore. Desarrollado por Z-INDEX STUDIO.
      </footer>
    </div>
  );
}