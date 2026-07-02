'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Trash2, CreditCard, Banknote, CheckCircle, X, Send } from 'lucide-react';

export default function AdminPOS() {
  const [productos, setProductos] = useState<any[]>([]);
  const [ticket, setTicket] = useState<any[]>([]);
  const [metodoPago, setMetodoPago] = useState<'Yape' | 'Efectivo'>('Yape');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para el Modal del Recibo
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  useEffect(() => {
    async function fetchProductos() {
      const { data } = await supabase.from('productos').select('*').order('nombre');
      if (data) setProductos(data);
    }
    fetchProductos();
  }, []);

  const agregarAlTicket = (prod: any) => {
    const existe = ticket.find(item => item.id === prod.id);
    if (existe) {
      setTicket(ticket.map(item => 
        item.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setTicket([...ticket, { ...prod, cantidad: 1 }]);
    }
  };

  const calcularTotal = () => ticket.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  const procesarVenta = async () => {
    if (ticket.length === 0) return;
    setIsProcessing(true);

    try {
      const totalVenta = calcularTotal();
      
      // 1. Guardar venta principal
      const { data: ventaData, error: ventaError } = await supabase
        .from('ventas')
        .insert([{ total: totalVenta, metodo_pago: metodoPago }])
        .select()
        .single();

      if (ventaError) throw ventaError;

      const ventaId = ventaData.id;

      // 2. Guardar detalles y actualizar stock
      for (const item of ticket) {
        const { error: detalleError } = await supabase
          .from('detalle_ventas')
          .insert([{
            venta_id: ventaId,
            producto_id: item.id,
            cantidad: item.cantidad,
            precio_unitario: item.precio
          }]);

        if (detalleError) throw detalleError;

        const nuevoStock = item.stock_actual - item.cantidad;
        await supabase.from('productos').update({ stock_actual: nuevoStock }).eq('id', item.id);
      }

      // 3. Preparar datos para el recibo antes de limpiar el carrito
      setLastSale({
        id: ventaId,
        items: [...ticket],
        total: totalVenta,
        metodo: metodoPago,
        fecha: new Date().toLocaleString('es-PE')
      });
      
      // 4. Limpiar y recargar
      setTicket([]);
      const { data: productosActualizados } = await supabase.from('productos').select('*').order('nombre');
      if (productosActualizados) setProductos(productosActualizados);
      
      // Mostrar el modal
      setShowReceipt(true);

    } catch (error) {
      console.error("Error en la transacción:", error);
      alert("Hubo un error al registrar la venta. Revisa la consola.");
    } finally {
      setIsProcessing(false);
    }
  };

  const enviarPorWhatsApp = () => {
    if (!lastSale) return;
    
    // Armamos el texto del recibo
    let mensaje = `*RECIBO DE COMPRA - SPORTSSTORE* 🏆\n\n`;
    mensaje += `*ID Venta:* ${lastSale.id.split('-')[0].toUpperCase()}\n`; // Usamos un fragmento del ID para que no sea tan largo
    mensaje += `*Fecha:* ${lastSale.fecha}\n`;
    mensaje += `*Método de Pago:* ${lastSale.metodo}\n\n`;
    mensaje += `*Detalle de tu compra:*\n`;
    
    lastSale.items.forEach((item: any) => {
      mensaje += `- ${item.cantidad}x ${item.nombre} (S/ ${(item.precio * item.cantidad).toFixed(2)})\n`;
    });
    
    mensaje += `\n*TOTAL PAGADO: S/ ${lastSale.total.toFixed(2)}*\n\n`;
    mensaje += `¡Gracias por tu preferencia! ⚽`;

    // Redirigir a WhatsApp (al dejar el número en blanco, te pedirá elegir el contacto)
    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-200 font-sans selection:bg-cyan-500/30">
      
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-black tracking-tight text-white">
          Z-INDEX <span className="text-cyan-400">POS</span>
        </h1>
        <div className="text-sm font-medium text-zinc-400">Modo Cajero</div>
      </header>

      <main className="flex flex-col lg:flex-row h-[calc(100vh-65px)]">
        
        {/* PANEL IZQUIERDO */}
        <section className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Catálogo Rápido</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {productos.map(prod => (
              <button 
                key={prod.id} 
                onClick={() => agregarAlTicket(prod)}
                disabled={prod.stock_actual <= 0}
                className={`border rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all active:scale-95 ${prod.stock_actual <= 0 ? 'bg-zinc-900/50 border-red-900/30 opacity-50 cursor-not-allowed' : 'bg-zinc-900 border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-800/50'}`}
              >
                <img src={prod.imagen_url} alt={prod.nombre} className="w-20 h-20 object-contain mb-3 drop-shadow-md" />
                <p className="text-xs font-semibold text-gray-300 line-clamp-2">{prod.nombre}</p>
                <p className="text-cyan-400 font-bold mt-1">S/ {prod.precio.toFixed(2)}</p>
                <p className={`text-xs mt-2 font-bold ${prod.stock_actual <= 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                  {prod.stock_actual <= 0 ? 'AGOTADO' : `Stock: ${prod.stock_actual}`}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* PANEL DERECHO */}
        <aside className="w-full lg:w-[400px] bg-zinc-900 border-l border-zinc-800 flex flex-col">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-cyan-400" /> Ticket Actual
            </h2>
            <button onClick={() => setTicket([])} className="text-zinc-500 hover:text-red-400 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {ticket.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-600 text-sm font-medium">
                Selecciona productos del catálogo
              </div>
            ) : (
              ticket.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-200">{item.nombre}</span>
                    <span className="text-xs text-zinc-500">{item.cantidad} x S/ {item.precio.toFixed(2)}</span>
                  </div>
                  <span className="font-bold text-cyan-400">S/ {(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-zinc-950 border-t border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <span className="text-zinc-400 font-medium">Total a cobrar</span>
              <span className="text-3xl font-black text-white">S/ {calcularTotal().toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button 
                onClick={() => setMetodoPago('Yape')}
                className={`py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border transition-all ${metodoPago === 'Yape' ? 'bg-[#742284] border-[#742284] text-white' : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
              >
                <CreditCard className="w-4 h-4" /> Yape / Plin
              </button>
              <button 
                onClick={() => setMetodoPago('Efectivo')}
                className={`py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border transition-all ${metodoPago === 'Efectivo' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
              >
                <Banknote className="w-4 h-4" /> Efectivo
              </button>
            </div>

            <button 
              onClick={procesarVenta}
              disabled={ticket.length === 0 || isProcessing}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black py-4 rounded-xl transition-all flex items-center justify-center"
            >
              {isProcessing ? 'Registrando...' : 'Procesar Venta'}
            </button>
          </div>
        </aside>
      </main>

      {/* MODAL DE RECIBO VIRTUAL */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Cabecera del modal */}
            <div className="bg-cyan-500/10 border-b border-cyan-500/20 p-6 flex flex-col items-center justify-center text-center relative">
              <button onClick={() => setShowReceipt(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <CheckCircle className="w-12 h-12 text-cyan-400 mb-3" />
              <h3 className="text-xl font-black text-white">¡Venta Exitosa!</h3>
              <p className="text-cyan-400 font-bold text-sm mt-1">ID: {lastSale.id.split('-')[0].toUpperCase()}</p>
            </div>

            {/* Cuerpo del recibo */}
            <div className="p-6">
              <div className="space-y-3 mb-6 max-h-40 overflow-y-auto pr-2">
                {lastSale.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-zinc-300">{item.cantidad}x {item.nombre}</span>
                    <span className="text-white font-medium">S/ {(item.precio * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-zinc-800 pt-4 flex justify-between items-center mb-6">
                <span className="text-zinc-400 font-medium">Total Pagado</span>
                <span className="text-2xl font-black text-cyan-400">S/ {lastSale.total.toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={enviarPorWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Enviar Recibo
                </button>
                <button 
                  onClick={() => setShowReceipt(false)}
                  className="w-full bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-800 font-bold py-3 rounded-xl transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}