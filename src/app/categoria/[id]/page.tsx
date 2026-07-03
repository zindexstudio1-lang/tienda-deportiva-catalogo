'use client';

import React, { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
// Importamos la conexión real
import { supabase } from '@/lib/supabase';

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Estados para productos y filtros
  const [productosBase, setProductosBase] = useState<any[]>([]); // Todos los que vienen de la DB
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Cargar productos desde Supabase
  useEffect(() => {
    async function fetchProducts() {
      // Traemos los productos cruzados con sus categorías para saber a qué sección pertenecen[cite: 3]
      const { data, error } = await supabase
        .from('productos')
        .select('*, categorias(slug)');

      if (data && !error) {
        const formateados = data.map(p => ({
          id: p.codigo,
          name: p.nombre,
          price: p.precio,
          image: p.imagen_url,
          category: p.categorias?.slug || 'otros'
        }));
        setProductosBase(formateados);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // 2. Ajustar filtros según la URL (si entra por el menú)
  useEffect(() => {
    if (id !== 'todos') {
      setSelectedCategories([id]);
    } else {
      setSelectedCategories([]);
    }
  }, [id]);

  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchTerm('');
    router.push('/categoria/todos');
  };

  // 3. Filtrar los productos cargados según lo que marque el usuario
  const filteredProducts = productosBase.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    return matchesSearch && matchesCategory;
  });

  const tituloPantalla = id === 'camisetas' ? 'Camisetas Oficiales' : id === 'fuerza' ? 'Equipamiento de Fuerza' : id === 'balones' ? 'Balones' : 'Todos los productos';

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 antialiased">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#002B5E] uppercase">{tituloPantalla}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR PARA PC */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                <h3 className="font-bold text-gray-900 tracking-wider">FILTROS</h3>
                <button 
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-red-600 font-medium transition-colors"
                >
                  Eliminar filtros
                </button>
              </div>
              
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Tipo de Producto</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes('camisetas')}
                      onChange={() => toggleCategory('camisetas')}
                      className="w-4 h-4 rounded border-gray-300 text-[#002B5E] focus:ring-[#002B5E]" 
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#002B5E]">Camisetas</span>
                  </label>
                  {/* Agregada la categoría de balones al filtro */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes('balones')}
                      onChange={() => toggleCategory('balones')}
                      className="w-4 h-4 rounded border-gray-300 text-[#002B5E] focus:ring-[#002B5E]" 
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#002B5E]">Balones</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes('fuerza')}
                      onChange={() => toggleCategory('fuerza')}
                      className="w-4 h-4 rounded border-gray-300 text-[#002B5E] focus:ring-[#002B5E]" 
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#002B5E]">Fuerza & Gym</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ÁREA PRINCIPAL */}
          <div className="lg:col-span-3">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              
              {/* BUSCADOR */}
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar productos..." 
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#002B5E]"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                <span className="text-sm font-bold text-gray-900">{filteredProducts.length} RESULTADOS</span>
                
                <button 
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-bold"
                >
                  <SlidersHorizontal className="w-4 h-4" /> Filtros
                </button>
              </div>
            </div>

            {/* GRID DE PRODUCTOS */}
            {loading ? (
               <div className="text-center py-20 text-[#002B5E] font-bold">Cargando catálogo...</div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-xl border border-gray-100">
                No se encontraron productos con esa búsqueda.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* PANEL DE FILTROS PARA CELULAR */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="relative w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#002B5E]">Filtros</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1">
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes('camisetas')}
                    onChange={() => toggleCategory('camisetas')}
                    className="w-5 h-5 rounded border-gray-300 text-[#002B5E]" 
                  />
                  <span className="text-base font-medium">Camisetas</span>
                </label>
                <label className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes('balones')}
                    onChange={() => toggleCategory('balones')}
                    className="w-5 h-5 rounded border-gray-300 text-[#002B5E]" 
                  />
                  <span className="text-base font-medium">Balones</span>
                </label>
                <label className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes('fuerza')}
                    onChange={() => toggleCategory('fuerza')}
                    className="w-5 h-5 rounded border-gray-300 text-[#002B5E]" 
                  />
                  <span className="text-base font-medium">Fuerza & Gym</span>
                </label>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 grid grid-cols-2 gap-4">
              <button onClick={clearFilters} className="py-3 text-sm font-bold text-gray-600 border border-gray-300 rounded-lg">Limpiar</button>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="py-3 text-sm font-bold text-white bg-[#002B5E] rounded-lg">Aplicar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}