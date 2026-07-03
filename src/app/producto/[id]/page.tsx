'use client';

import React, { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { ArrowLeft, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isAdded, setIsAdded] = useState(false); 
  const [showError, setShowError] = useState(false); 
  
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      const { data: productData, error: productError } = await supabase
        .from('productos')
        .select('*, categorias(slug)')
        .eq('codigo', id)
        .single();

      if (productData && !productError) {
        
        // Convertimos el texto "S,M,L" en un arreglo real para el desplegable
        const sizesArray = productData.tallas 
          ? productData.tallas.split(',').map((s: string) => s.trim()) 
          : null;

        const formattedProduct = {
          id: productData.codigo,
          name: productData.nombre,
          price: productData.precio,
          image: productData.imagen_url,
          description: productData.descripcion || 'Producto de alta calidad.',
          category: productData.categorias?.slug,
          sizes: sizesArray 
        };
        setProduct(formattedProduct);

        const { data: relatedData } = await supabase
          .from('productos')
          .select('*')
          .eq('categoria_id', productData.categoria_id)
          .neq('codigo', id)
          .limit(4);

        if (relatedData) {
          const formattedRelated = relatedData.map(p => ({
            id: p.codigo, name: p.nombre, price: p.precio, image: p.imagen_url, category: 'dinamico'
          }));
          setRelatedProducts(formattedRelated);
        }
      }
      setLoading(false);
    }
    
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-2xl font-bold text-[#002B5E]">Cargando...</div>;

  if (!product) return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center text-[#002B5E]">
      <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
      <button onClick={() => router.back()} className="text-gray-500 hover:text-[#002B5E] flex items-center gap-2 font-bold"><ArrowLeft className="w-4 h-4" /> Volver al catálogo</button>
    </div>
  );

  const handleAddToCart = () => {
    if (product.sizes && !selectedSize) {
      setShowError(true); return;
    }
    setShowError(false); 
    addToCart(product, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000); 
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 antialiased">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 bg-white mt-8 shadow-sm rounded-lg">
        <div className="mb-4 pt-4">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#002B5E] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al catálogo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4 pb-16">
          <div className="flex justify-center items-center bg-white p-8">
            <img src={product.image} alt={product.name} className="max-w-full h-auto max-h-[500px] object-contain" />
          </div>

          <div className="flex flex-col justify-start pt-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl font-bold text-red-600">S/ {product.price.toFixed(2)}</span>
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Precio Web</span>
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8 border-b border-gray-300 pb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Tallas</label>
                <select 
                  className={`w-full border rounded-md p-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#002B5E] transition-colors ${showError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  value={selectedSize}
                  onChange={(e) => { setSelectedSize(e.target.value); setShowError(false); }}
                >
                  <option value="" disabled>Seleccionar talla...</option>
                  {product.sizes.map((size: string) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                {showError && <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1.5 animate-pulse"><span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>Por favor, selecciona una talla</p>}
              </div>
            )}

            <button onClick={handleAddToCart} disabled={isAdded} className={`flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 rounded text-sm font-bold text-white transition-all shadow-sm ${(product.sizes && !selectedSize) ? 'bg-gray-400 cursor-not-allowed' : isAdded ? 'bg-green-600 hover:bg-green-700' : 'bg-[#8B8970] hover:bg-[#72705b]'}`}>
              {isAdded ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
              {isAdded ? '¡Agregado al carrito!' : 'Agregar al carrito'}
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 py-12 bg-[#F1F3F6] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 uppercase tracking-widest mb-6">Detalles del Producto</h2>
          <p className="max-w-4xl mx-auto text-center text-gray-600 font-medium whitespace-pre-wrap">{product.description}</p>
        </div>

        {relatedProducts.length > 0 && (
          <div className="py-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 uppercase tracking-widest mb-10">Completa tu indumentaria</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}