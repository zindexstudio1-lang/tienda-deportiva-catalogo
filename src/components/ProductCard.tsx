import React from 'react';
import Link from 'next/link';

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
        
        {/* BADGES DE STOCK */}
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
        {/* ¡Eliminamos la etiqueta del SKU de aquí! El cliente ya no la verá */}
      </div>

      <div className="flex flex-1 flex-col p-4 border-t border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-[#002B5E] transition-colors h-10">
          {product.name}
        </h3>
        
        <div className="mt-4 flex flex-col gap-2">
          {/* SOLUCIÓN AL DISEÑO EN MÓVIL: Flex-wrap, whitespace-nowrap y shrink-0 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-bold text-red-600 whitespace-nowrap">
              S/ {product.price.toFixed(2)}
            </span>
            <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase whitespace-nowrap shrink-0">
              Precio web
            </span>
          </div>
          
          {/* BOTÓN DINÁMICO */}
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