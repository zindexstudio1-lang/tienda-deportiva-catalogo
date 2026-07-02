'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dumbbell, Shirt, Layers, ShoppingBag, Menu, X, Home, Trophy } from 'lucide-react'; 
import { useCart } from '@/store/cartStore'; 
import { usePathname } from 'next/navigation'; 


export default function Navbar() {
  const { items, openCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname(); 
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const categories = [
    { id: 'todos', label: 'Todos', icon: Layers },
    { id: 'camisetas', label: 'Camisetas', icon: Shirt },
    { id: 'balones', label: 'Balones', icon: Trophy },
    { id: 'fuerza', label: 'Fuerza & Gym', icon: Dumbbell },
  ];

  return (
    <>
      {/* 1. LA CABECERA PRINCIPAL */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between relative z-50 bg-transparent">
            
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="text-xl font-black tracking-tight text-[#002B5E]">
                SPORTS<span className="text-[#C5A059]">STORE</span>
              </span>
            </Link>

            <div className="flex items-center gap-2 md:gap-4">
              <nav className="hidden md:flex space-x-1 md:space-x-4">
                
                {/* BOTÓN DE INICIO NUEVO */}
                <Link
                  href="/"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                    pathname === '/'
                      ? 'bg-[#002B5E] text-white shadow-sm'
                      : 'text-gray-600 hover:text-[#002B5E] hover:bg-gray-100'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Inicio</span>
                </Link>

                {/* ITERACIÓN DE LAS CATEGORÍAS */}
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  // Ajustamos para que "Todos" solo esté activo en la ruta exacta /categoria/todos
                  const isActive = pathname === `/categoria/${cat.id}`;
                  return (
                    <Link
                      key={cat.id}
                      href={`/categoria/${cat.id}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#002B5E] text-white shadow-sm'
                          : 'text-gray-600 hover:text-[#002B5E] hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{cat.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <button 
                onClick={openCart} 
                className="flex items-center text-[#002B5E] hover:opacity-80 cursor-pointer relative p-2 bg-white rounded-md transition-colors hover:bg-gray-50 border border-gray-200 shadow-sm"
              >
                <ShoppingBag className="h-6 w-6" />
                {isMounted && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#C5A059] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden flex items-center justify-center p-2 text-[#002B5E] bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. EL MENÚ MÓVIL */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div 
        className={`md:hidden fixed top-0 right-0 w-[85%] max-w-sm h-[100dvh] bg-white z-[110] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col pt-20 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 flex-1 overflow-y-auto">
          <nav className="flex flex-col gap-2">
            
            {/* BOTÓN INICIO EN MÓVIL CON ICONO */}
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-4 text-lg font-bold rounded-xl transition-colors ${
                pathname === '/' 
                  ? 'bg-[#002B5E] text-white' 
                  : 'text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-[#002B5E]'
              }`}
            >
              <Home className="h-5 w-5" />
              Inicio
            </Link>

            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = pathname === `/categoria/${cat.id}`;
              return (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-4 text-lg font-bold rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#002B5E] text-white'
                      : 'text-gray-600 bg-transparent hover:bg-gray-50 hover:text-[#002B5E]'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {cat.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}