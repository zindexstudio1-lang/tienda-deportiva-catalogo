'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Delete } from 'lucide-react';

export default function POSLogin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  // Por ahora usaremos '1234'. Luego puedes cambiarlo a lo que prefieras.
  const PIN_CORRECTO = '1234'; 

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      const nuevoPin = pin + num;
      setPin(nuevoPin);
      setError(false);
      
      // Si llega a 4 dígitos, validamos automáticamente (sin tener que darle a "Enter")
      if (nuevoPin.length === 4) {
        if (nuevoPin === PIN_CORRECTO) {
          // Creamos la "llave" (cookie) válida por 12 horas y lo dejamos pasar
          document.cookie = "pos_auth=true; path=/; max-age=43200";
          router.push('/admin');
        } else {
          // Si falla, mostramos error y limpiamos los círculos
          setError(true);
          setTimeout(() => setPin(''), 500); 
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center selection:bg-cyan-500/30 px-4">
      
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
          <Lock className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Z-INDEX <span className="text-cyan-400">POS</span></h1>
        <p className="text-zinc-500 font-medium mt-1">Ingresa tu PIN de acceso</p>
      </div>

      {/* Los 4 círculos del PIN */}
      <div className="flex gap-4 mb-10">
        {[0, 1, 2, 3].map((index) => (
          <div 
            key={index}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              pin.length > index 
                ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' 
                : 'bg-zinc-800'
            } ${error ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse' : ''}`}
          />
        ))}
      </div>

      {/* Teclado Numérico */}
      <div className="grid grid-cols-3 gap-4 max-w-[280px] w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handlePress(num.toString())}
            className="h-16 bg-zinc-900 border border-zinc-800 rounded-xl text-2xl font-bold text-white hover:bg-zinc-800 hover:border-cyan-500/50 active:scale-95 transition-all flex items-center justify-center"
          >
            {num}
          </button>
        ))}
        
        <div className="h-16"></div> {/* Espacio vacío */}
        
        <button
          onClick={() => handlePress('0')}
          className="h-16 bg-zinc-900 border border-zinc-800 rounded-xl text-2xl font-bold text-white hover:bg-zinc-800 hover:border-cyan-500/50 active:scale-95 transition-all flex items-center justify-center"
        >
          0
        </button>
        
        <button
          onClick={handleDelete}
          className="h-16 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
}