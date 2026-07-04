import React from 'react';
import Link from 'next/link';
// Puedes mantener tu importación de Product, pero usaremos 'any' en las props 
// para aceptar el 'stock_actual' sin que TypeScript se queje por ahora.
import { Product } from '../data/products'; 

interface ProductCardProps {
  product: any; 
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 ${
      product.stock_actual <= 0 
        ? 'border-gray-200 opacity-75 grayscale-[50%]' 
        : 'border-gray-200 hover:shadow-lg hover:border-gray-300'
    }`}>
      
      <div className="aspect-square w-full overflow-hidden bg-white relative p-4 flex items-center justify-center">
        
        {/* NUEVO: BADGES DE STOCK */}
        {product.stock_actual <= 0 ? (
          <span className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-black z-20 shadow-sm">
            AGOTADO
          </span>
        ) : product.stock_actual < 8 ? (
          <span className="absolute top-3 right-3 bg-orange-100 text-orange-600 border border-orange-200 px-2 py-1 rounded text-[10px] font-bold animate-pulse z-20">
            ¡Solo quedan {product.stock_actual}!
          </span>
        ) : null}

        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 rounded-md bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-bold tracking-widest text-[#002B5E] border border-gray-200 shadow-sm z-10">
          {product.sku || product.id}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 border-t border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-[#002B5E] transition-colors h-10">
          {product.name}
        </h3>
        
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-red-600">S/ {product.price.toFixed(2)}</span>
            <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Precio web</span>
          </div>
          
          {/* NUEVO: BOTÓN DINÁMICO */}
          {product.stock_actual <= 0 ? (
            <div className="w-full text-center rounded bg-gray-200 px-3 py-2 text-xs font-bold text-gray-500 cursor-not-allowed">
              Agotado
            </div>
          ) : (
            <Link
              href={`/producto/${product.id}`}
              className="w-full text-center rounded bg-[#8B8970] px-3 py-2 text-xs font-bold text-white transition-all hover:bg-[#72705b] active:scale-95 shadow-sm"
            >
              ¡Lo quiero!
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}