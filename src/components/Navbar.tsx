'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dumbbell, Shirt, Layers, ShoppingBag } from 'lucide-react'; 
import { useCart } from '@/store/cartStore'; 

interface NavbarProps {
  activeCategory: string;
  setActiveCategory: (category: any) => void;
}

export default function Navbar({ activeCategory, setActiveCategory }: NavbarProps) {
  const { items, openCart } = useCart();
  const [isMounted, setIsMounted] = useState(false); // Lógica de montaje
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const categories = [
    { id: 'todos', label: 'Todos', icon: Layers },
    { id: 'camisetas', label: 'Camisetas', icon: Shirt },
    { id: 'fuerza', label: 'Fuerza & Gym', icon: Dumbbell },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl font-black tracking-tight text-[#002B5E]">
              SPORTS<span className="text-[#C5A059]">STORE</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
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
                    <span className="hidden sm:inline">{cat.label}</span>
                  </button>
                );
              })}
            </nav>

            <button 
              onClick={openCart} 
              className="flex items-center text-[#002B5E] hover:opacity-80 cursor-pointer relative ml-4 p-2 bg-gray-50 rounded-full transition-colors hover:bg-gray-100"
            >
              <ShoppingBag className="h-6 w-6" />
              {/* AQUÍ TAMBIÉN REVISAMOS SI ESTÁ MONTADO PARA EVITAR EL ERROR */}
              {isMounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C5A059] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}