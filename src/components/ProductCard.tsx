import React from 'react';
import Link from 'next/link';
import { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
      <div className="aspect-square w-full overflow-hidden bg-white relative p-4 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 rounded-md bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-bold tracking-widest text-[#002B5E] border border-gray-200 shadow-sm">
          {product.sku}
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
          
          <Link
            href={`/producto/${product.id}`}
            className="w-full text-center rounded bg-[#8B8970] px-3 py-2 text-xs font-bold text-white transition-all hover:bg-[#72705b] active:scale-95 shadow-sm"
          >
            ¡Lo quiero!
          </Link>
        </div>
      </div>
    </div>
  );
}