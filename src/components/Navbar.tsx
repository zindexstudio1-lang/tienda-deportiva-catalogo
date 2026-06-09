'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dumbbell, Shirt, Layers, ShoppingBag, Menu, X, Search } from 'lucide-react'; 
import { useCart } from '@/store/cartStore'; 

interface NavbarProps {
  activeCategory: string;
  setActiveCategory: (category: any) => void;
}

export default function Navbar({ activeCategory, setActiveCategory }: NavbarProps) {
  const { items, openCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  
  // NUEVO: Estado para controlar si el menú de celular está abierto o cerrado
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const categories = [
    { id: 'todos', label: 'Todos los productos', icon: Layers },
    { id: 'camisetas', label: 'Camisetas', icon: Shirt },
    { id: 'fuerza', label: 'Fuerza & Gym', icon: Dumbbell },
  ];

  // Función para cuando seleccionan una categoría en el celular
  const handleCategorySelect = (id: string) => {
    setActiveCategory(id);
    setIsMobileMenuOpen(false); // Cierra el menú al elegir
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="text-xl font-black tracking-tight text-[#002B5E]">
              SPORTS<span className="text-[#C5A059]">STORE</span>
            </span>
          </Link>

          {/* Botones de la derecha */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Navegación para Computadoras (Oculto en celular) */}
            <nav className="hidden md:flex space-x-1 md:space-x-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#002B5E] text-white shadow-sm'
                        : 'text-gray-600 hover:text-[#002B5E] hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{cat.label === 'Todos los productos' ? 'Todos' : cat.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Botón del Carrito (Visible siempre) */}
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

            {/* Botón Menú Hamburguesa (Visible SOLO en celular) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 text-[#002B5E] bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* PANTALLA DEL MENÚ PARA CELULARES (Estilo Alianza Lima) */}
      <div 
        className={`md:hidden fixed top-16 left-0 w-full h-[calc(100vh-4rem)] bg-white z-40 transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          
          {/* Buscador Visual */}
          <div className="relative mb-8 mt-2">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar producto" 
              className="w-full bg-[#F1F3F6] text-gray-900 rounded-full pl-12 pr-4 py-3.5 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[#002B5E]"
            />
          </div>

          {/* Lista de Categorías */}
          <nav className="flex flex-col">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center text-left py-4 text-lg font-medium text-gray-800 border-b border-gray-100 hover:text-[#002B5E]"
            >
              Tienda
            </Link>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className="flex items-center text-left py-4 text-lg font-medium text-gray-800 border-b border-gray-100 hover:text-[#002B5E] last:border-0"
              >
                {cat.label}
              </button>
            ))}
          </nav>

        </div>
      </div>
    </header>
  );
}