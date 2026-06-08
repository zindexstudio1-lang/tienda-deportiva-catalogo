'use client';

import React from 'react';
import Link from 'next/link'; // Importamos Link
import { Dumbbell, Shirt, Layers } from 'lucide-react';

interface NavbarProps {
  activeCategory: string;
  setActiveCategory: (category: any) => void;
}

export default function Navbar({ activeCategory, setActiveCategory }: NavbarProps) {
  const categories = [
    { id: 'todos', label: 'Todos', icon: Layers },
    { id: 'camisetas', label: 'Camisetas', icon: Shirt },
    { id: 'fuerza', label: 'Fuerza & Gym', icon: Dumbbell },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* AHORA EL LOGO ES UN ENLACE QUE LLEVA A LA RAÍZ "/" */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl font-black tracking-tight text-[#002B5E]">
              SPORTS<span className="text-[#C5A059]">STORE</span>
            </span>
          </Link>

          {/* Categorías - Navegación */}
          <nav className="flex space-x-1 md:space-x-4">
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
        </div>
      </div>
    </header>
  );
}