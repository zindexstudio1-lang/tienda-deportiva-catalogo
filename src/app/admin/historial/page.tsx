'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Search, CreditCard, Banknote, CalendarDays, FileText, TrendingUp, Send } from 'lucide-react';
import Link from 'next/link';

export default function HistorialVentas() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTiempo, setFiltroTiempo] = useState('hoy');
  const [limite, setLimite] = useState(20);

  useEffect(() => {
    cargarHistorial(filtroTiempo);
  }, [filtroTiempo, limite]);

 async function cargarHistorial(filtro: string) {
    setLoading(true);

    let query = supabase
      .from('ventas')
      .select(`
        id,
        created_at,
        total,
        metodo_pago,
        detalle_ventas!detalle_ventas_venta_id_fkey (
          cantidad,
          precio_unitario,
          productos ( nombre, codigo )
        )
      `)
      .order('created_at', { ascending: false });

    const ahora = new Date();
    
    if (filtro === 'hoy') {
      const inicioHoy = new Date(ahora.setHours(0,0,0,0)).toISOString();
      query = query.gte('created_at', inicioHoy);
    } else if (filtro === '7dias') {
      const hace7Dias = new Date(ahora.setDate(ahora.getDate() - 7)).toISOString();
      query = query.gte('created_at', hace7Dias);
    } else if (filtro === 'mes') {
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();
      query = query.gte('created_at', inicioMes);
    }

    // NUEVO: Le aplicamos el límite antes de ejecutar
    query = query.limit(limite);

    const { data, error } = await query;

    if (error) {
      console.error("Error al cargar ventas:", error);
    } else {
      setVentas(data || []);
    }
    setLoading(false);
  }

  // Métricas rápidas
  const totalIngresos = ventas.reduce((acc, v) => acc + v.total, 0);
  const totalYape = ventas.filter(v => v.metodo_pago === 'Yape').reduce((acc, v) => acc + v.total, 0);
  const totalEfectivo = ventas.filter(v => v.metodo_pago === 'Efectivo').reduce((acc, v) => acc + v.total, 0);

  // Filtro por ID de ticket
  const ventasFiltradas = ventas.filter(v => 
    v.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-200 font-sans selection:bg-cyan-500/30 flex flex-col">
      
      {/* CABECERA */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            Historial de <span className="text-cyan-400">Ventas</span>
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* DASHBOARD DE MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-500">Ingresos Totales</p>
              <p className="text-2xl font-black text-white">S/ {totalIngresos.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#742284]/10 flex items-center justify-center border border-[#742284]/20">
              <CreditCard className="w-6 h-6 text-[#742284]" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-500">Total Yape / Plin</p>
              <p className="text-2xl font-black text-white">S/ {totalYape.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Banknote className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-500">Total Efectivo</p>
              <p className="text-2xl font-black text-white">S/ {totalEfectivo.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* FILTROS DE TIEMPO (CUADRE DE CAJA) */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
          {[
            { id: 'hoy', label: 'Hoy' },
            { id: '7dias', label: 'Últimos 7 Días' },
            { id: 'mes', label: 'Este Mes' },
            { id: 'todo', label: 'Histórico Completo' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltroTiempo(f.id)}
              className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors border ${
                filtroTiempo === f.id 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50' 
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* BUSCADOR */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por número de Ticket (Ej: 96250060)" 
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-12 pr-4 py-3.5 font-medium focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-zinc-600"
          />
        </div>

        {/* LISTA DE TICKETS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-cyan-400 font-bold animate-pulse">Cargando registros...</div>
          ) : ventasFiltradas.length === 0 ? (
            <div className="p-10 text-center text-zinc-500 font-medium flex flex-col items-center gap-2">
              <FileText className="w-10 h-10 opacity-20" />
              No hay ventas registradas aún
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {ventasFiltradas.map((venta) => {
                const ticketId = venta.id.split('-')[0].toUpperCase();
                const fechaFormateada = new Date(venta.created_at).toLocaleString('es-PE', {
                  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                return (
                  <div key={venta.id} className="p-4 sm:p-6 hover:bg-zinc-800/30 transition-colors">
                    
                    {/* CABECERA DEL TICKET */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-cyan-400 text-lg">#{ticketId}</p>
                          <p className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
                            <CalendarDays className="w-3 h-3" /> {fechaFormateada}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${venta.metodo_pago === 'Yape' ? 'bg-[#742284]/10 text-[#742284] border-[#742284]/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {venta.metodo_pago}
                        </span>
                        <span className="text-xl font-black text-white mr-2">S/ {venta.total.toFixed(2)}</span>
                        
                        {/* NUEVO BOTÓN DE WHATSAPP */}
                        <button 
                          onClick={() => {
                            const textoWa = `Hola! Te compartimos el comprobante de tu compra:\n*SPORTS STORE* - Ticket #${ticketId} por S/${venta.total.toFixed(2)}\n¡Gracias por tu preferencia!`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(textoWa)}`, '_blank');
                          }}
                          className="p-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-lg transition-colors border border-[#25D366]/20 flex items-center gap-2"
                          title="Reenviar por WhatsApp"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* DETALLE DE PRODUCTOS */}
                    <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/50">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-zinc-800/50">
                          {venta.detalle_ventas.map((detalle: any, idx: number) => (
                            <tr key={idx} className="text-zinc-300">
                              <td className="py-2 w-8 font-bold text-zinc-500">{detalle.cantidad}x</td>
                              <td className="py-2">
                                {detalle.productos?.nombre || 'Producto eliminado'}
                                <span className="block text-[10px] font-mono text-zinc-600 mt-0.5">{detalle.productos?.codigo || 'N/A'}</span>
                              </td>
                              <td className="py-2 text-right font-medium">S/ {(detalle.precio_unitario * detalle.cantidad).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      
      {/* BOTÓN CARGAR MÁS */}
        {ventasFiltradas.length >= limite && !loading && (
          <div className="flex justify-center pt-4 pb-8">
            <button
              onClick={() => setLimite(limite + 20)}
              className="px-6 py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl transition-colors flex items-center gap-2"
            >
              Cargar más tickets
            </button>
          </div>
        )}
      
      
      </main>
    </div>
  );
}