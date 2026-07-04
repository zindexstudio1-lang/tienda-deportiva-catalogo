'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Trash2, CreditCard, Banknote, Search, Plus, Minus, PackagePlus, Settings, X, FileText, Send, Edit, PlusCircle, Filter, Download, UploadCloud } from 'lucide-react';
import { toPng } from 'html-to-image';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast'; // NUEVO: Importación de Toasts

export default function AdminPOS() {
  const [productos, setProductos] = useState<any[]>([]);
  const [categoriasDb, setCategoriasDb] = useState<any[]>([]);
  const [ticket, setTicket] = useState<any[]>([]);
  const [metodoPago, setMetodoPago] = useState<'Yape' | 'Efectivo'>('Yape');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados de Búsqueda y Filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todas');
  
  // Estados de Interfaz
  const [isMobileTicketOpen, setIsMobileTicketOpen] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  // Nueva Categoría
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [businessData, setBusinessData] = useState({
    nombre: 'SPORTSSTORE',
    ruc: '20123456789',
    telefono: '+51 999 888 777',
    mensaje: '¡Gracias por tu compra!'
  });

  const initialStateProd = {
    nombre: '', precio: '', stock: '0', imagen: '', categoria_id: '', slug_cat: '', descripcion: '', tallas: '',
    stock_tallas: { S: 0, M: 0, L: 0, XL: 0 }
  };
  const [prodForm, setProdForm] = useState(initialStateProd);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const { data: prods } = await supabase.from('productos').select('*').order('nombre');
    if (prods) setProductos(prods);

    const { data: cats } = await supabase.from('categorias').select('*');
    if (cats && cats.length > 0) {
      setCategoriasDb(cats);
    }
  }

  // --- LÓGICA DE IMÁGENES (SUPABASE STORAGE) ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploadingImage(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `productos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('imagenes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('imagenes').getPublicUrl(filePath);
      setProdForm(prev => ({ ...prev, imagen: data.publicUrl }));
      toast.success('Imagen subida con éxito');
    } catch (error) {
      toast.error('Error al subir imagen. Verifica tener un bucket público llamado "imagenes" en Supabase.');
      console.error(error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // --- LÓGICA DE TICKET ---
  const agregarAlTicket = (prod: any) => {
    const existe = ticket.find(item => item.id === prod.id);
    if (existe) {
      if (existe.cantidad < prod.stock_actual) {
        setTicket(ticket.map(item => item.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item));
      } else {
        toast.error('No hay más stock disponible de este producto');
      }
    } else {
      setTicket([...ticket, { ...prod, cantidad: 1 }]);
    }
  };

  const modificarCantidad = (id: string, delta: number) => {
    setTicket(prev => prev.map(item => {
      if (item.id === id) {
        const nuevaCant = item.cantidad + delta;
        if (nuevaCant <= 0) return null; 
        if (nuevaCant > item.stock_actual) {
          toast.error('Límite de stock alcanzado');
          return item; 
        }
        return { ...item, cantidad: nuevaCant };
      }
      return item;
    }).filter(Boolean) as any[]); 
  };

  const calcularTotal = () => ticket.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  
  const productosFiltrados = productos.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'todas' || p.categoria_id?.toString() === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // --- LÓGICA CRUD PRODUCTOS ---
  const abrirModalNuevo = () => {
    setIsEditing(false);
    setEditingId(null);
    setProdForm({ ...initialStateProd, categoria_id: categoriasDb[0]?.id.toString() || '', slug_cat: categoriasDb[0]?.slug || '' });
    setShowProductModal(true);
  };

  const abrirModalEditar = async (e: React.MouseEvent, prod: any) => {
    e.stopPropagation(); 
    setIsEditing(true);
    setEditingId(prod.id);
    
    // 1. Identificamos qué categoría es para saber si tiene tallas
    const slugCat = prod.categoria_id 
      ? (categoriasDb.find(c => c.id === prod.categoria_id)?.slug || '') 
      : (categoriasDb[0]?.slug || '');

    // 2. Cargamos los datos básicos al formulario de inmediato
    setProdForm({
      ...initialStateProd,
      nombre: prod.nombre || '',
      precio: prod.precio ? prod.precio.toString() : '0',
      stock: prod.stock_actual ? prod.stock_actual.toString() : '0',
      imagen: prod.imagen_url || '',
      categoria_id: prod.categoria_id ? prod.categoria_id.toString() : (categoriasDb[0]?.id.toString() || ''),
      slug_cat: slugCat,
      descripcion: prod.descripcion || '',
      tallas: prod.tallas || '',
      stock_tallas: { S: 0, M: 0, L: 0, XL: 0 } // Ponemos 0 temporalmente
    });
    
    setShowProductModal(true);

    // 3. ¡LA MAGIA! Si es camiseta, vamos a buscar su stock exacto a la base de datos
    if (slugCat === 'camisetas') {
      const { data: variantes } = await supabase
        .from('producto_variantes')
        .select('talla, stock')
        .eq('producto_id', prod.id);

      if (variantes && variantes.length > 0) {
        const tallasRecuperadas = { S: 0, M: 0, L: 0, XL: 0 };
        // Llenamos el objeto con lo que devolvió Supabase
        variantes.forEach(v => {
          if (tallasRecuperadas[v.talla as keyof typeof tallasRecuperadas] !== undefined) {
            tallasRecuperadas[v.talla as keyof typeof tallasRecuperadas] = v.stock;
          }
        });
        
        // Actualizamos los cuadritos con los números reales
        setProdForm(prev => ({ ...prev, stock_tallas: tallasRecuperadas }));
      }
    }
  };

  const generarSKU = (slugCat: string) => {
    const prefijo = slugCat ? slugCat.substring(0, 3).toUpperCase() : 'PRO';
    const randomHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(4, '0');
    return `${prefijo}-${randomHex}`;
  };

const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let stockFinal = parseInt(prodForm.stock) || 0;
    let tallasString = prodForm.tallas;

    if (prodForm.slug_cat === 'camisetas') {
      const { S, M, L, XL } = prodForm.stock_tallas;
      stockFinal = Number(S) + Number(M) + Number(L) + Number(XL);
      
      const tallasDisponibles = [];
      if (Number(S) > 0) tallasDisponibles.push('S');
      if (Number(M) > 0) tallasDisponibles.push('M');
      if (Number(L) > 0) tallasDisponibles.push('L');
      if (Number(XL) > 0) tallasDisponibles.push('XL');
      tallasString = tallasDisponibles.join(',');
    }

    const payload = {
      nombre: prodForm.nombre,
      precio: parseFloat(prodForm.precio),
      stock_actual: stockFinal,
      imagen_url: prodForm.imagen || '/placeholder.png',
      categoria_id: prodForm.categoria_id, // Sin el parseInt para evitar el error NULL
      descripcion: prodForm.descripcion || 'Producto de alta calidad.',
      tallas: tallasString || null
    };

    if (isEditing && editingId) {
      const { error } = await supabase.from('productos').update(payload).eq('id', editingId);
      if (!error) {
        
        // --- NUEVO: LÓGICA DE TALLAS PARA ACTUALIZAR ---
        if (prodForm.slug_cat === 'camisetas') {
          // 1. Borramos las tallas viejas por seguridad
          await supabase.from('producto_variantes').delete().eq('producto_id', editingId);
          // 2. Preparamos las nuevas
          const variantes = Object.entries(prodForm.stock_tallas)
            .filter(([_, cant]) => Number(cant) > 0)
            .map(([talla, cant]) => ({ producto_id: editingId, talla, stock: Number(cant) }));
          // 3. Las insertamos
          if (variantes.length > 0) await supabase.from('producto_variantes').insert(variantes);
        }

        toast.success('Producto actualizado correctamente');
        setShowProductModal(false);
        cargarDatos();
      } else {
        toast.error('Error al actualizar el producto');
      }
    } else {
      const skuGenerado = generarSKU(prodForm.slug_cat);
      const { data: newProd, error } = await supabase.from('productos').insert([{ ...payload, codigo: skuGenerado }]).select().single();
      
      if (!error && newProd) {

        // --- NUEVO: LÓGICA DE TALLAS PARA CREAR ---
        if (prodForm.slug_cat === 'camisetas') {
          const variantes = Object.entries(prodForm.stock_tallas)
            .filter(([_, cant]) => Number(cant) > 0)
            .map(([talla, cant]) => ({ producto_id: newProd.id, talla, stock: Number(cant) }));
          
          if (variantes.length > 0) await supabase.from('producto_variantes').insert(variantes);
        }

        toast.success(`Producto creado. SKU: ${skuGenerado}`);
        setShowProductModal(false);
        cargarDatos();
      } else {
        toast.error('Error al crear el producto');
      }
    }
  };

  const crearCategoria = async () => {
    if(!newCatName) return;
    const slug = newCatName.toLowerCase().replace(/ /g, '-');
    const { data, error } = await supabase.from('categorias').insert([{ nombre: newCatName, slug }]).select().single();
    
    if(!error && data) {
      setCategoriasDb([...categoriasDb, data]);
      setProdForm({ ...prodForm, categoria_id: data.id.toString(), slug_cat: data.slug });
      setShowNewCatInput(false);
      setNewCatName('');
      toast.success('Categoría creada con éxito');
    } else {
      toast.error('Error creando categoría');
    }
  };

  const procesarVenta = async () => {
    if (ticket.length === 0) return;
    setIsProcessing(true);

    try {
      const totalVenta = calcularTotal();
      const { data: ventaData, error: ventaError } = await supabase.from('ventas').insert([{ total: totalVenta, metodo_pago: metodoPago }]).select().single();
      if (ventaError) throw ventaError;

      for (const item of ticket) {
        await supabase.from('detalle_ventas').insert([{ venta_id: ventaData.id, producto_id: item.id, cantidad: item.cantidad, precio_unitario: item.precio }]);
        await supabase.from('productos').update({ stock_actual: item.stock_actual - item.cantidad }).eq('id', item.id);
      }

      setLastSale({ id: ventaData.id, items: [...ticket], total: totalVenta, metodo: metodoPago, fecha: new Date().toLocaleString('es-PE') });
      setTicket([]);
      cargarDatos();
      setIsMobileTicketOpen(false);
      setShowReceipt(true);
      toast.success('¡Venta registrada con éxito!');
    } catch (error) {
      toast.error("Hubo un error al registrar la venta.");
    } finally {
      setIsProcessing(false);
    }
  };

  const guardarImagen = async () => {
    const elemento = document.getElementById('recibo-imprimible');
    if (!elemento) return;

    try {
      const dataUrl = await toPng(elemento, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        style: { margin: '0' }
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Ticket-${lastSale?.id.split('-')[0].toUpperCase()}.png`;
      link.click();
      toast.success('Ticket descargado');
    } catch (error) {
      console.error("Error al generar la imagen:", error);
      toast.error("Hubo un problema al guardar el ticket.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-200 font-sans selection:bg-cyan-500/30 flex flex-col">
      
      {/* NUEVO: CONFIGURACIÓN DE TOASTS */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#18181b', 
            color: '#fff',
            border: '1px solid #27272a', 
          },
          success: {
            iconTheme: { primary: '#06b6d4', secondary: '#18181b' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#18181b' },
          }
        }} 
      />

      <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center z-10">
        <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
          Z-INDEX <span className="text-cyan-400">POS</span>
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={abrirModalNuevo} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-cyan-400 transition-colors hidden sm:flex items-center gap-2 text-sm font-bold">
            <PackagePlus className="w-4 h-4" /> Nuevo Producto
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-400 hover:text-white transition-colors" title="Ajustes del Recibo">
            <Settings className="w-5 h-5" />
          </button>
          <Link href="/admin/historial" className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white font-bold text-sm transition-colors mr-2">
            Ver Historial
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <section className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
          
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por Nombre o código SKU" className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-3 font-medium focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-zinc-600" />
            </div>
            
            <div className="flex gap-2">
              <div className="relative w-12 h-12 sm:h-[50px]">
                <div className={`w-full h-full flex items-center justify-center rounded-xl border transition-colors ${selectedCategoryFilter !== 'todas' ? 'bg-zinc-800 border-cyan-500/50 text-cyan-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                  <Filter className="w-5 h-5" />
                </div>
                {/* SOLUCIÓN AL DISEÑO DEL SELECT: Clases en las options */}
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Filtrar por categoría"
                >
                  <option value="todas" className="bg-zinc-900 text-white">Todas las categorías</option>
                  {categoriasDb.map(cat => (
                    <option key={cat.id} value={cat.id.toString()} className="bg-zinc-900 text-white">{cat.nombre}</option>
                  ))}
                </select>
              </div>
              
              <button onClick={abrirModalNuevo} className="sm:hidden w-12 h-12 sm:h-[50px] flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl text-cyan-400 hover:bg-zinc-800 hover:border-cyan-500/50 transition-colors">
                <PackagePlus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-24 lg:pb-0 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {productosFiltrados.map(prod => (
                <div key={prod.id} className="relative group">
                  <button 
                    onClick={() => agregarAlTicket(prod)}
                    disabled={prod.stock_actual <= 0}
                    className={`w-full h-full border rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all active:scale-95 relative ${
                      prod.stock_actual <= 0 
                      ? 'bg-zinc-900/50 border-red-900/30 opacity-60 cursor-not-allowed grayscale' 
                      : 'bg-zinc-900 border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-800/50'
                    }`}
                  >
                    <span className="absolute top-2 left-2 text-[10px] font-mono text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 z-10">
                      {prod.codigo}
                    </span>

                    {prod.stock_actual === 0 ? (
                      <span className="absolute top-2 right-2 bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-black z-10 shadow-lg shadow-red-500/10">
                        AGOTADO
                      </span>
                    ) : prod.stock_actual < 8 ? (
                      <span className="absolute top-2 right-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse z-10">
                        ¡Solo quedan {prod.stock_actual}!
                      </span>
                    ) : null}

                    <img src={prod.imagen_url} alt={prod.nombre} className={`w-16 h-16 sm:w-20 sm:h-20 object-contain mb-3 drop-shadow-md mt-5 transition-transform ${prod.stock_actual > 0 && 'group-hover:scale-110'}`} />
                    <p className="text-xs font-semibold text-gray-300 line-clamp-2">{prod.nombre}</p>
                    
                    {prod.tallas && prod.tallas !== 'NULO' && (
                      <div className="mt-2 flex flex-wrap justify-center gap-1">
                        {prod.tallas.split(',').map((talla: string, idx: number) => (
                          <span key={idx} className="text-[9px] font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
                            {talla.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-cyan-400 font-black text-lg mt-2">S/ {prod.precio.toFixed(2)}</p>
                  </button>
                  
                  <button 
                    onClick={(e) => abrirModalEditar(e, prod)}
                    className="absolute top-10 right-2 p-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors z-20 lg:opacity-0 group-hover:opacity-100 shadow-xl"
                    title="Editar Producto"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {productosFiltrados.length === 0 && (
                <div className="col-span-full flex items-center justify-center py-10 text-zinc-500 font-medium text-sm">
                  No se encontraron productos
                </div>
              )}
            </div>
          </div>
        </section>

        {isMobileTicketOpen && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setIsMobileTicketOpen(false)} />}

        <aside className={`fixed inset-y-0 right-0 z-30 w-[85%] sm:w-[400px] bg-zinc-900 border-l border-zinc-800 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileTicketOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 z-10 pt-safe">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-cyan-400" /> Ticket Actual</h2>
            <div className="flex gap-3">
              <button onClick={() => setTicket([])} className="text-zinc-500 hover:text-red-400 transition-colors"><Trash2 className="w-5 h-5" /></button>
              <button onClick={() => setIsMobileTicketOpen(false)} className="lg:hidden text-zinc-500 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
            {ticket.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-sm font-medium gap-2"><ShoppingCart className="w-12 h-12 opacity-20" /> El ticket está vacío</div>
            ) : (
              ticket.map(item => (
                <div key={item.id} className="flex flex-col bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-gray-200 line-clamp-2 pr-2">{item.nombre}</span>
                    <span className="font-bold text-cyan-400 whitespace-nowrap">S/ {(item.precio * item.cantidad).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-zinc-500">{item.codigo}</span>
                    <div className="flex items-center gap-3 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                      <button onClick={() => modificarCantidad(item.id, -1)} className="text-zinc-400 hover:text-white p-1"><Minus className="w-3 h-3" /></button>
                      <span className="text-xs font-bold w-4 text-center">{item.cantidad}</span>
                      <button onClick={() => modificarCantidad(item.id, 1)} className="text-zinc-400 hover:text-white p-1"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 sm:p-6 bg-zinc-950 border-t border-zinc-800">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <span className="text-zinc-400 font-medium">Total a cobrar</span>
              <span className="text-3xl font-black text-white">S/ {calcularTotal().toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
              <button onClick={() => setMetodoPago('Yape')} className={`py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border transition-all ${metodoPago === 'Yape' ? 'bg-[#742284] border-[#742284] text-white' : 'bg-transparent border-zinc-700 text-zinc-400'}`}><CreditCard className="w-4 h-4" /> Yape/Plin</button>
              <button onClick={() => setMetodoPago('Efectivo')} className={`py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border transition-all ${metodoPago === 'Efectivo' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-transparent border-zinc-700 text-zinc-400'}`}><Banknote className="w-4 h-4" /> Efectivo</button>
            </div>
            <button onClick={procesarVenta} disabled={ticket.length === 0 || isProcessing} className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black py-4 rounded-xl transition-all">
              {isProcessing ? 'Registrando...' : 'Procesar Venta'}
            </button>
          </div>
        </aside>

        {!isMobileTicketOpen && ticket.length > 0 && (
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-20">
            <button onClick={() => setIsMobileTicketOpen(true)} className="w-full bg-cyan-500 text-zinc-950 font-black py-4 px-6 rounded-2xl shadow-2xl flex justify-between items-center border border-cyan-400">
              <span className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Ver Ticket ({ticket.length})</span>
              <span>S/ {calcularTotal().toFixed(2)}</span>
            </button>
          </div>
        )}
      </main>

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-white">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setShowProductModal(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={guardarProducto} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Categoría</label>
                <div className="flex gap-2">
                  {!showNewCatInput ? (
                    <>
                      {/* SOLUCIÓN AL DISEÑO DEL SELECT DEL FORMULARIO */}
                      <select 
                        value={prodForm.categoria_id} 
                        onChange={e => {
                          const cat = categoriasDb.find(c => c.id === parseInt(e.target.value));
                          setProdForm({...prodForm, categoria_id: e.target.value, slug_cat: cat ? cat.slug : ''});
                        }}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 outline-none font-bold"
                      >
                        {categoriasDb.map(cat => <option key={cat.id} value={cat.id} className="bg-zinc-900 text-white">{cat.nombre}</option>)}
                      </select>
                      <button type="button" onClick={() => setShowNewCatInput(true)} className="bg-zinc-800 px-3 rounded-lg text-cyan-400 hover:bg-zinc-700 flex items-center justify-center gap-1 text-xs font-bold"><PlusCircle className="w-4 h-4"/> Nueva</button>
                    </>
                  ) : (
                    <div className="flex-1 flex gap-2">
                      <input autoFocus type="text" placeholder="Nombre categoría" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 outline-none text-sm" />
                      <button type="button" onClick={crearCategoria} className="bg-cyan-500 text-zinc-950 px-3 rounded-lg font-bold text-sm">Crear</button>
                      <button type="button" onClick={() => setShowNewCatInput(false)} className="bg-zinc-800 px-3 rounded-lg text-zinc-400"><X className="w-4 h-4"/></button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Nombre del producto</label>
                <input required type="text" value={prodForm.nombre} onChange={e => setProdForm({...prodForm, nombre: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Precio (S/)</label>
                  <input required type="number" step="0.01" value={prodForm.precio} onChange={e => setProdForm({...prodForm, precio: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" />
                </div>
                
                {/* LÓGICA DINÁMICA DE STOCK */}
                {prodForm.slug_cat === 'camisetas' ? (
                  <div className="col-span-1 border border-zinc-800 p-2 rounded-lg bg-zinc-950/50">
                    <label className="block text-[10px] font-bold text-cyan-400 mb-2 uppercase tracking-wider text-center">Stock por Talla</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {['S', 'M', 'L', 'XL'].map((talla) => (
                        <div key={talla}>
                          <label className="block text-[9px] text-zinc-500 font-bold text-center mb-1">{talla}</label>
                          <input 
                            type="number" 
                            min="0"
                            value={prodForm.stock_tallas[talla as keyof typeof prodForm.stock_tallas]}
                            onChange={e => {
                              const val = e.target.value;
                              setProdForm({
                                ...prodForm, 
                                // Si está vacío lo dejamos vacío para que puedas escribir, si no, guardamos el número
                                stock_tallas: { ...prodForm.stock_tallas, [talla]: val === '' ? '' : parseInt(val) }
                              });
                            }}
                            /* Clases especiales para ocultar las flechas molestas del input number */
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-white text-center text-sm focus:border-cyan-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">Stock General</label>
                    <input 
                      required 
                      type="number" 
                      min="0" 
                      value={prodForm.stock} 
                      onChange={e => setProdForm({...prodForm, stock: e.target.value})} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" 
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Imagen del Producto</label>
                <div className="flex gap-2">
                  <input type="text" value={prodForm.imagen} onChange={e => setProdForm({...prodForm, imagen: e.target.value})} placeholder="URL de la imagen..." className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 outline-none text-sm" />
                  
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      disabled={isUploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                    />
                    <div className={`h-full px-4 rounded-lg flex items-center justify-center gap-2 border font-bold text-sm transition-colors ${isUploadingImage ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20'}`}>
                      {isUploadingImage ? 'Subiendo...' : <><UploadCloud className="w-4 h-4"/> Archivo</>}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Descripción del Producto</label>
                <textarea rows={3} value={prodForm.descripcion} onChange={e => setProdForm({...prodForm, descripcion: e.target.value})} placeholder="Escribe los detalles aquí..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 outline-none text-sm custom-scrollbar" />
              </div>
              <button type="submit" className="w-full bg-cyan-500 text-zinc-950 font-bold py-3 rounded-lg mt-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-shadow">
                {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2"><Settings className="w-4 h-4"/> Configurar Ticket</h3>
              <button onClick={() => setShowSettings(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Nombre del Negocio</label>
                <input type="text" value={businessData.nombre} onChange={e => setBusinessData({...businessData, nombre: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">RUC / NIT</label>
                <input type="text" value={businessData.ruc} onChange={e => setBusinessData({...businessData, ruc: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Teléfono</label>
                <input type="text" value={businessData.telefono} onChange={e => setBusinessData({...businessData, telefono: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Mensaje de pie de página</label>
                <input type="text" value={businessData.mensaje} onChange={e => setBusinessData({...businessData, mensaje: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" />
              </div>
              <button onClick={() => setShowSettings(false)} className="w-full bg-cyan-500 text-zinc-900 font-bold py-3 rounded-lg mt-2">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {showReceipt && lastSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md flex flex-col gap-4">
            <div id="recibo-imprimible" className="bg-white text-black p-8 rounded-none w-full shadow-2xl printable-ticket">
              <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-4">
                <h2 className="text-2xl font-black uppercase tracking-widest">{businessData.nombre}</h2>
                <p className="text-sm text-gray-600 mt-1">RUC: {businessData.ruc}</p>
                <p className="text-sm text-gray-600">Cel: {businessData.telefono}</p>
              </div>
              <div className="mb-6 space-y-1 text-sm font-mono">
                <p><strong>TICKET:</strong> #{lastSale.id.split('-')[0].toUpperCase()}</p>
                <p><strong>FECHA:</strong> {lastSale.fecha}</p>
                <p><strong>MÉTODO:</strong> {lastSale.metodo}</p>
              </div>
              <table className="w-full text-sm mb-6 font-mono">
                <thead>
                  <tr className="border-y-2 border-dashed border-gray-300">
                    <th className="py-2 text-left w-12">CANT</th>
                    <th className="py-2 text-left px-2">DESCRIPCIÓN</th>
                    <th className="py-2 text-right w-16">IMP</th>
                  </tr>
                </thead>
                <tbody>
                  {lastSale.items.map((item: any) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-2 align-top">{item.cantidad}</td>
                      <td className="py-2 px-2">{item.nombre} <br/><span className="text-[10px] text-gray-500">{item.codigo}</span></td>
                      <td className="py-2 text-right align-top">{(item.precio * item.cantidad).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center text-lg font-black border-t-2 border-dashed border-gray-300 pt-4 mb-6">
                <span>TOTAL A PAGAR</span><span>S/ {lastSale.total.toFixed(2)}</span>
              </div>
              <div className="text-center text-sm font-bold text-gray-600"><p>{businessData.mensaje}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 no-print">
              <button onClick={guardarImagen} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                <Download className="w-4 h-4" /> Guardar Imagen
              </button>
              
              <button onClick={() => {
                const msj = `*${businessData.nombre}*\n`;
                const textoWa = `Hola! Adjunto tu comprobante de compra:\n*${businessData.nombre}* - Ticket #${lastSale.id.split('-')[0].toUpperCase()} por S/${lastSale.total.toFixed(2)}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(textoWa)}`, '_blank');
              }} className="bg-[#25D366] text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                <Send className="w-4 h-4" /> WhatsApp
              </button>
              
              <button onClick={() => setShowReceipt(false)} className="col-span-2 bg-transparent border border-zinc-700 text-zinc-400 hover:text-white py-3 rounded-xl transition-colors">
                Cerrar y nueva venta
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media print { 
          @page { margin: 0; size: 80mm auto; }
          body * { visibility: hidden; } 
          #recibo-imprimible, #recibo-imprimible * { visibility: visible; } 
          #recibo-imprimible { position: absolute; left: 0; top: 0; width: 80mm; padding: 15px; margin: 0; } 
          .no-print { display: none !important; } 
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}} />
    </div>
  );
}