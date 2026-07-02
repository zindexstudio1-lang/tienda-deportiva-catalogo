'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, ArrowRight, Zap, Dumbbell, Shirt, Trophy } from 'lucide-react';
import Link from 'next/link';

const BANNERS = [
  { id: 1, imageDesktop: '/anuncioCamisetas.png', imageMobile: '/anunCamiCelu.png', alt: 'Nueva Colección' },
  { id: 2, imageDesktop: '/anuncioPortugal.png', imageMobile: '/anunPortuCelu.png', alt: 'Premium' }
];

const TOP_ANNOUNCEMENTS = [
  "🔥 Envíos a todo el Perú",
  "⚡ Aceptamos Yape y Plin",
  "🚚 Envío gratis por compras mayores a S/ 200"
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTopAnnouncement, setCurrentTopAnnouncement] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [destacados, setDestacados] = useState<any[]>([]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));

  useEffect(() => {
    if (BANNERS.length <= 1) return;
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    const announcementInterval = setInterval(() => {
      setCurrentTopAnnouncement((prev) => (prev === TOP_ANNOUNCEMENTS.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(announcementInterval);
  }, []);

  useEffect(() => {
    async function cargarProductos() {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .limit(6);

      if (data && !error) {
        const productosFormateados = data.map(item => ({
          id: item.codigo,
          name: item.nombre,
          price: item.precio,
          image: item.imagen_url,
          category: 'dinamico'
        }));
        setDestacados(productosFormateados);
      }
    }
    cargarProductos();
  }, []);

  const scrollProducts = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 antialiased selection:bg-[#002B5E] selection:text-white">
      
      {/* 1. TOP BAR */}
      <div className="bg-[#002B5E] text-white text-xs font-medium py-2 px-4 text-center overflow-hidden h-8 flex items-center justify-center">
        <div className="relative w-full max-w-md">
          {TOP_ANNOUNCEMENTS.map((text, index) => (
            <p 
              key={index} 
              className={`absolute top-1/2 left-0 w-full transform -translate-y-1/2 transition-all duration-500 ease-in-out flex items-center justify-center gap-2
                ${currentTopAnnouncement === index ? 'opacity-100 translate-y-[-50%]' : 'opacity-0 translate-y-full pointer-events-none'}`}
            >
              <Zap className="w-3 h-3 text-[#C5A059]" /> {text}
            </p>
          ))}
        </div>
      </div>

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* 2. HERO BANNER */}
        <div className="relative mb-12 group">
          <div className="relative w-full overflow-hidden rounded-[20px] md:rounded-[32px] bg-gray-200 shadow-sm flex items-center justify-center aspect-[3/4] sm:aspect-[4/3] md:aspect-[21/9]">
            <picture className="w-full h-full">
              <source media="(min-width: 768px)" srcSet={BANNERS[0].imageDesktop} />
              <img src={BANNERS[0].imageMobile} alt="placeholder" className="w-full h-full object-cover opacity-0 pointer-events-none" />
            </picture>

            {BANNERS.map((banner, index) => (
              <div key={banner.id} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <picture className="w-full h-full">
                  <source media="(min-width: 768px)" srcSet={banner.imageDesktop} />
                  <img src={banner.imageMobile} alt={banner.alt} className="w-full h-full object-cover" />
                </picture>
              </div>
            ))}

            <button 
              onClick={prevSlide} 
              className="absolute left-4 z-20 p-3 rounded-lg bg-white shadow-md text-slate-900 hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center opacity-90 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button 
              onClick={nextSlide} 
              className="absolute right-4 z-20 p-3 rounded-lg bg-white shadow-md text-slate-900 hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center opacity-90 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 items-center">
              {BANNERS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`rounded-full transition-all duration-300 ${
                    currentSlide === index 
                      ? 'bg-[#C5A059] w-8 h-2'
                      : 'bg-transparent border-[1.5px] border-white/80 w-2 h-2'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 3. BANNERS DIVISORIOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <Link href="/categoria/camisetas" className="group relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#002B5E] to-[#004080] p-6 text-white shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1">
            <div className="z-10 relative">
              <p className="text-sm font-bold tracking-widest text-[#C5A059] uppercase mb-1">Pasión por el Fútbol</p>
              <h3 className="text-2xl font-black mb-2">Camisetas 2025</h3>
              <span className="inline-flex items-center gap-1 text-sm font-medium hover:underline">Ver catálogo <ArrowRight className="w-4 h-4" /></span>
            </div>
            <Shirt className="w-24 h-24 absolute right-4 opacity-10 transform -rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </Link>

          <Link href="/categoria/balones" className="group relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#C5A059] to-[#d4b475] p-6 text-white shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1">
            <div className="z-10 relative">
              <p className="text-sm font-bold tracking-widest text-white/80 uppercase mb-1">Anota un Gol</p>
              <h3 className="text-2xl font-black mb-2">Balones</h3>
              <span className="inline-flex items-center gap-1 text-sm font-medium hover:underline">Ver catálogo <ArrowRight className="w-4 h-4" /></span>
            </div>
            <Trophy className="w-24 h-24 absolute right-4 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </Link>

          <Link href="/categoria/fuerza-gym" className="group relative overflow-hidden rounded-[20px] bg-white border border-gray-200 p-6 text-slate-900 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1">
            <div className="z-10 relative">
              <p className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-1">Arma tu Gym en casa</p>
              <h3 className="text-2xl font-black text-[#002B5E] mb-2">Fuerza & Gym</h3>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-[#002B5E] hover:text-[#C5A059] transition-colors">Ver equipos <ArrowRight className="w-4 h-4" /></span>
            </div>
            <Dumbbell className="w-24 h-24 absolute right-4 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform duration-500 text-slate-900" />
          </Link>
        </div>

        {/* 4. PRODUCTOS DESTACADOS */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-1">Productos Destacados</p>
              <h2 className="text-3xl font-black text-[#002B5E]">Lo más vendido</h2>
            </div>
            <div className="hidden md:flex gap-2">
              <button onClick={() => scrollProducts('left')} className="p-2 rounded-full border border-gray-300 hover:bg-[#002B5E] hover:text-white hover:border-[#002B5E] transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => scrollProducts('right')} className="p-2 rounded-full border border-gray-300 hover:bg-[#002B5E] hover:text-white hover:border-[#002B5E] transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div 
            ref={sliderRef}
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-proximity scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {destacados.map((product) => (
              <div key={product.id} className="min-w-[280px] w-[280px] sm:min-w-[300px] sm:w-[300px] snap-start shrink-0">
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