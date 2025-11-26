
import React, { useEffect, useState } from 'react';
import { InventorySession, Sede, Coleccion } from '../types';
import { getSessions, deleteSession, createSession } from '../services/storageService';
import { Button, Input, Select } from '../components/Button';
import { BookOpen, Trash2, ArrowRight, Save, History } from 'lucide-react';

interface HomeScreenProps {
  onSessionCreated: (session: InventorySession) => void;
  onOpenSession: (session: InventorySession) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSessionCreated, onOpenSession }) => {
  const [sessions, setSessions] = useState<InventorySession[]>([]);
  
  // Form State
  const [name, setName] = useState('');
  const [sede, setSede] = useState<Sede>(Sede.MEDELLIN);
  const [coleccion, setColeccion] = useState<Coleccion>(Coleccion.LIBROS);

  const loadSessions = () => {
    const data = getSessions().sort((a, b) => b.updatedAt - a.updatedAt);
    setSessions(data);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor ingrese un nombre para el inventario.');
      return;
    }
    const session = createSession(name, sede, coleccion);
    onSessionCreated(session);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('¿Está seguro de eliminar este registro de inventario? Esta acción no se puede deshacer.')) {
      deleteSession(id);
      loadSessions();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-brand-700 text-white p-6 shadow-md">
        <h1 className="text-2xl font-bold">BiblioTrack</h1>
        <p className="text-brand-100 text-sm">Inventario de Biblioteca</p>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* New Session Form (Default View) */}
        <div className="bg-white p-6 shadow-sm border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={24} className="text-brand-600" />
            Nuevo Inventario
          </h2>
          
          <form onSubmit={handleCreate}>
            <Input 
              label="Nombre del Registro" 
              placeholder="Ej. Estantería 1A - Enero 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
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

            <Button type="submit" fullWidth className="mt-2">
              <Save size={20} />
              Iniciar Escaneo
            </Button>
          </form>
        </div>

        {/* History Section */}
        <div className="p-6">
          <h3 className="text-md font-bold text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2">
            <History size={16} />
            Inventarios Anteriores
          </h3>
          
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
              <p>No hay historial reciente.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map(session => (
                <div 
                  key={session.id} 
                  onClick={() => onOpenSession(session)}
                  className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm md:text-base">{session.name}</h3>
                      <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold mt-2">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">{session.sede}</span>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100">{session.coleccion}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {session.items.length} códigos • {new Date(session.updatedAt).toLocaleDateString()} {new Date(session.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                       <button 
                          onClick={(e) => handleDelete(e, session.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="Eliminar registro"
                       >
                         <Trash2 size={18} />
                       </button>
                       <div className="p-2 text-brand-200 group-hover:text-brand-500 transition-colors">
                          <ArrowRight size={18} />
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
