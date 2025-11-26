import { GoogleGenAI } from "@google/genai";
import { InventorySession } from '../types';

export const generateInventoryReport = async (session: InventorySession): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Error: API Key no configurada para el servicio de reporte.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const totalItems = session.items.length;
  const startTime = new Date(session.createdAt).toLocaleString();
  const lastItem = session.items.length > 0 ? session.items[session.items.length - 1] : null;
  const lastTime = lastItem ? new Date(lastItem.timestamp).toLocaleString() : 'N/A';
  
  // Sample of first 5 and last 5 barcodes for context
  const sampleItems = [
    ...session.items.slice(0, 5),
    ...session.items.slice(-5)
  ].map(i => i.barcode).join(', ');

  const prompt = `
    Actúa como un bibliotecario experto. Genera un resumen ejecutivo breve y profesional para un reporte de inventario.
    
    Datos de la sesión:
    - Nombre del Inventario: ${session.name}
    - Sede: ${session.sede}
    - Colección: ${session.coleccion}
    - Total ítems escaneados: ${totalItems}
    - Fecha inicio: ${startTime}
    - Fecha último escaneo: ${lastTime}
    
    El reporte debe confirmar que el inventario se realizó exitosamente y está listo para conciliación. 
    Menciona que los datos están seguros. Sé conciso (máximo 100 palabras).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No se pudo generar el reporte.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Hubo un error conectando con el servicio de IA para generar el reporte.";
  }
};