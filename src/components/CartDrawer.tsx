'use client';

import React, { useState, useEffect } from 'react'; 
import { useCart } from '@/store/cartStore';
import { X, Trash2, MessageCircle, ShoppingBag } from 'lucide-react';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, getTotal } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const WHATSAPP_NUMBER = '51923469044'; // Tu número de WhatsApp

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    let message = `¡Hola! Quiero realizar el siguiente pedido desde la web:\n\n`;
    
    items.forEach((item, index) => {
      const talla = item.selectedSize ? ` (Talla: ${item.selectedSize})` : '';
      message += `${index + 1}. *${item.name}* ${talla}\n`;
      message += `   SKU: ${item.id} | Cant: ${item.quantity} | S/ ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });

    message += `*TOTAL A PAGAR: S/ ${getTotal().toFixed(2)}*\n\n`;
    message += `¿Me confirman stock y método de pago, por favor?`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  // ESTA ES LA LÍNEA CLAVE PARA EVITAR EL ERROR ROJO
  if (!isMounted) return null;

  return (
    <>
      {/* Fondo oscuro desenfocado */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeCart}
      />

      {/* Panel lateral derecho */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        
        {/* Cabecera del Carrito */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#002B5E]" />
            <h2 className="text-lg font-bold text-[#002B5E]">Tu Carrito</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
              {items.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <button onClick={closeCart} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <ShoppingBag className="h-12 w-12 opacity-20" />
              <p className="font-medium">Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartItemId} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-contain bg-gray-50 rounded-lg p-1" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{item.name}</h3>
                    <div className="text-xs text-gray-500 mt-1 space-x-2">
                      <span className="font-mono bg-gray-100 px-1 rounded">{item.sku}</span>
                      {item.selectedSize && <span className="font-bold text-[#C5A059]">Talla: {item.selectedSize}</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-black text-[#002B5E]">
                      S/ {(item.price * item.quantity).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-500">Cant: {item.quantity}</span>
                      <button 
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer del Carrito (Total y Botón WhatsApp) */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-600">Total estimado</span>
            <span className="text-xl font-black text-[#002B5E]">S/ {getTotal().toFixed(2)}</span>
          </div>
          
          <button
            onClick={handleWhatsAppCheckout}
            disabled={items.length === 0}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-lg text-sm font-bold text-white transition-all shadow-sm ${
              items.length === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-[#25D366] hover:bg-[#1EBE5A] hover:shadow-md'
            }`}
          >
            <MessageCircle className="h-5 w-5" />
            Comprar por WhatsApp
          </button>
        </div>

      </div>
    </>
  );
}