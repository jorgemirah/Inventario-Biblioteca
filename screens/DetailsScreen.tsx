
import React, { useState, useEffect } from 'react';
import { InventorySession, InventoryItem } from '../types';
import { saveSession } from '../services/storageService';
import { Button } from '../components/Button';
import { ArrowLeft, Trash2, Mail, MessageCircle } from 'lucide-react';

interface DetailsScreenProps {
  session: InventorySession;
  onBack: () => void;
  onSessionUpdate: (session: InventorySession) => void;
}

export const DetailsScreen: React.FC<DetailsScreenProps> = ({ session, onBack, onSessionUpdate }) => {
  const [currentSession, setCurrentSession] = useState(session);

  // Sync prop changes
  useEffect(() => {
    setCurrentSession(session);
  }, [session]);

  const handleDeleteItem = (itemToDelete: InventoryItem) => {
    if (window.confirm('¿Eliminar este código del registro?')) {
      const updatedItems = currentSession.items.filter(i => {
        // Robust filtering: Use ID if available on both, otherwise fallback to timestamp
        if (itemToDelete.id && i.id) {
          return i.id !== itemToDelete.id;
        }
        // Fallback for legacy items created before IDs were implemented
        return i.timestamp !== itemToDelete.timestamp;
      });
      
      const updatedSession = { ...currentSession, items: updatedItems, updatedAt: Date.now() };
      
      setCurrentSession(updatedSession);
      saveSession(updatedSession);
      onSessionUpdate(updatedSession); // Notify parent to keep state in sync
    }
  };

  const getCSV = () => {
    const headers = "Barcode,Fecha,Hora,Sede,Coleccion\n";
    const rows = currentSession.items.map(item => {
      const date = new Date(item.timestamp);
      return `${item.barcode},${date.toLocaleDateString()},${date.toLocaleTimeString()},${currentSession.sede},${currentSession.coleccion}`;
    }).join("\n");
    return headers + rows;
  };

  const handleExportEmail = () => {
    const subject = `Inventario: ${currentSession.name}`;
    const body = `Adjunto registro de inventario.\n\nSede: ${currentSession.sede}\nColección: ${currentSession.coleccion}\nTotal: ${currentSession.items.length}\n\nDatos:\n${getCSV()}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleExportWhatsApp = () => {
    const text = `Inventario ${currentSession.name} (${currentSession.sede}). Total: ${currentSession.items.length} items.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="flex items-center gap-3 p-4 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 overflow-hidden">
           <h1 className="text-lg font-bold text-slate-800 leading-tight truncate">{currentSession.name}</h1>
           <p className="text-xs text-slate-500">{currentSession.sede} • {currentSession.coleccion}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
          <h2 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Exportar Resultados</h2>
          <div className="grid grid-cols-2 gap-3">
             <Button onClick={handleExportEmail} variant="secondary" className="text-sm py-2">
                <Mail size={18} /> Email
             </Button>
             <Button onClick={handleExportWhatsApp} variant="secondary" className="text-sm py-2">
                <MessageCircle size={18} /> WhatsApp
             </Button>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
           <h2 className="font-bold text-slate-700">Ítems Escaneados ({currentSession.items.length})</h2>
        </div>

        {currentSession.items.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
            No hay códigos registrados aún.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {[...currentSession.items].reverse().map((item, index) => (
              <div key={item.id || index} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
                <div>
                  <div className="font-mono text-lg font-bold text-slate-800">{item.barcode}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteItem(item)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
