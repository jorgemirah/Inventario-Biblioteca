import React, { useState } from 'react';
import { Sede, Coleccion } from '../types';
import { createSession } from '../services/storageService';
import { Button, Select, Input } from '../components/Button';
import { ArrowLeft, Save } from 'lucide-react';

interface NewSessionScreenProps {
  onBack: () => void;
  onCreated: (session: any) => void;
}

export const NewSessionScreen: React.FC<NewSessionScreenProps> = ({ onBack, onCreated }) => {
  const [name, setName] = useState('');
  const [sede, setSede] = useState<Sede>(Sede.MEDELLIN);
  const [coleccion, setColeccion] = useState<Coleccion>(Coleccion.LIBROS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor ingrese un nombre para el inventario.');
      return;
    }
    const session = createSession(name, sede, coleccion);
    onCreated(session);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex items-center gap-3 p-4 border-b border-slate-100">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Iniciar Inventario</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <Input 
            label="Nombre del Registro (Único)" 
            placeholder="Ej. Estantería 1A - Enero 2024"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <Select 
            label="Sede" 
            value={sede} 
            onChange={(e) => setSede(e.target.value as Sede)}
          >
            {Object.values(Sede).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>

          <Select 
            label="Colección" 
            value={coleccion} 
            onChange={(e) => setColeccion(e.target.value as Coleccion)}
          >
            {Object.values(Coleccion).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>

        <Button type="submit" fullWidth>
          <Save size={20} />
          Comenzar Inventario
        </Button>
      </form>
    </div>
  );
};