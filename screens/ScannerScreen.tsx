
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { InventorySession, InventoryItem } from '../types';
import { saveSession } from '../services/storageService';
import { playBeep } from '../utils/sound';
import { generateId } from '../utils/helpers';
import { Button } from '../components/Button';
import { ArrowLeft, Flashlight, Keyboard, CheckCircle, Barcode, List, AlertTriangle } from 'lucide-react';

interface ScannerScreenProps {
  session: InventorySession;
  onBack: () => void;
  onViewList: () => void;
  onSessionUpdate: (session: InventorySession) => void;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ session, onBack, onViewList, onSessionUpdate }) => {
  const [currentSession, setCurrentSession] = useState(session);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync prop changes (important for when items are deleted in Details screen)
  useEffect(() => {
    setCurrentSession(session);
  }, [session]);

  // --- Camera Logic ---
  
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    // Ensure previous stream is stopped before starting a new one
    stopCamera();
    setCameraError(null);

    // Security Check for Mobile Testing
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setCameraError("HTTPS Requerido: La cámara no funciona en conexiones no seguras. Despliega la app en Vercel/Netlify o usa localhost.");
      return;
    }

    try {
      let stream: MediaStream | null = null;

      // 1. Try environment camera specifically first
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
      } catch (envError) {
        console.warn("Environment camera not found, trying fallback", envError);
        // 2. Fallback: Try any video camera
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (fallbackError) {
          console.error("No camera accessible", fallbackError);
          setCameraError("No se pudo acceder a la cámara. Verifique los permisos del navegador.");
          return;
        }
      }

      if (!stream) {
        setCameraError("No se encontró ninguna cámara disponible.");
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // 3. Apply torch if requested and supported
      if (torchOn) {
        const track = stream.getVideoTracks()[0];
        if (track) {
          try {
             // Basic check for capability
             const capabilities = track.getCapabilities ? track.getCapabilities() : {};
             // @ts-ignore - torch is not in standard lib types yet
             if (capabilities.torch || 'torch' in capabilities || 'fillLightMode' in capabilities) {
                await track.applyConstraints({
                  advanced: [{ torch: true } as any]
                });
             }
          } catch (e) {
            console.warn("Flashlight apply failed or not supported", e);
          }
        }
      }

    } catch (err) {
      console.error("Critical error accessing camera:", err);
      setCameraError("Error inesperado al iniciar la cámara.");
    }
  }, [torchOn, stopCamera]);

  useEffect(() => {
    if (isScanning && !scanSuccess) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isScanning, scanSuccess, startCamera, stopCamera]);

  const toggleTorch = () => {
    setTorchOn(prev => !prev);
  };

  // --- Scan Logic ---

  const handleScan = (code: string) => {
    if (!code.trim()) return;

    playBeep();
    
    // Create new item with safe ID
    const newItem: InventoryItem = {
      id: generateId(),
      barcode: code.trim(),
      timestamp: Date.now(),
      synced: false
    };

    const updatedSession = {
      ...currentSession,
      updatedAt: Date.now(),
      items: [...currentSession.items, newItem]
    };

    setCurrentSession(updatedSession);
    saveSession(updatedSession);
    onSessionUpdate(updatedSession);
    
    setScanSuccess(code);
    setManualCode('');
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScan(manualCode);
  };

  const resetScan = () => {
    setScanSuccess(null);
    setIsScanning(true);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm absolute top-0 left-0 right-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold opacity-80 truncate max-w-[150px]">{currentSession.name}</h2>
          <p className="text-xs opacity-60">Items: {currentSession.items.length}</p>
        </div>
        <button 
          onClick={onViewList}
          className="p-2 bg-brand-600 rounded-full text-white shadow-lg shadow-brand-500/50"
          title="Ver Lista"
        >
          <List size={20} />
        </button>
      </div>

      {/* Main View Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-900">
        {scanSuccess ? (
          <div className="flex flex-col items-center p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/50">
              <CheckCircle size={48} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">¡Registrado!</h3>
            <p className="text-xl text-green-300 font-mono mb-8 tracking-widest bg-green-900/30 px-4 py-2 rounded">{scanSuccess}</p>
            
            <Button onClick={resetScan} className="bg-white text-black hover:bg-gray-200 w-64 shadow-xl" variant="secondary">
              <Barcode className="mr-2" />
              Escanear Otro Material
            </Button>
          </div>
        ) : (
          <>
            {/* Camera View */}
            {!cameraError && (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="absolute inset-0 w-full h-full object-cover opacity-80" 
              />
            )}

            {/* Error Message */}
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-8 text-center z-30">
                <AlertTriangle size={48} className="text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Problema de Cámara</h3>
                <p className="text-gray-400 mb-6">{cameraError}</p>
                <Button onClick={() => startCamera()} variant="secondary">
                  Reintentar
                </Button>
              </div>
            )}
            
            {/* Scanning Overlay */}
            {!cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-72 h-48 relative">
                   {/* Corners */}
                   <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-lg"></div>
                   <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-lg"></div>
                   <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-lg"></div>
                   <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-lg"></div>
                   
                   {/* Laser */}
                   <div className="w-full h-0.5 bg-red-500 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_15px_red]"></div>
                </div>
                <p className="mt-8 text-sm text-white/90 font-medium bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                  Apunta al código de barras
                </p>
              </div>
            )}

            {/* Controls */}
            {!cameraError && (
              <div className="absolute top-20 right-4 z-20 flex flex-col gap-4">
                <button 
                  onClick={toggleTorch} 
                  className={`p-3 rounded-full ${torchOn ? 'bg-yellow-400 text-black shadow-yellow-400/50' : 'bg-black/40 text-white border border-white/20'} backdrop-blur-md shadow-lg transition-all`}
                >
                  <Flashlight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Manual Entry Footer */}
      {!scanSuccess && (
        <div className="bg-white p-4 rounded-t-2xl z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Keyboard className="absolute left-3 top-3.5 text-slate-400" size={20} />
              <input 
                type="text" 
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ingresar código manual..." 
                className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none font-mono text-lg"
              />
            </div>
            <Button type="submit" disabled={!manualCode} variant="primary" className="aspect-square px-0 w-[52px]">
              <CheckCircle size={24} />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
