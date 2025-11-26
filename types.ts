export enum Sede {
  MEDELLIN = 'MEDELLIN',
  ORIENTE = 'ORIENTE',
  URABA = 'URABA'
}

export enum Coleccion {
  LIBROS = 'LIBROS',
  REVISTAS = 'REVISTAS',
  FOLLETOS = 'FOLLETOS',
  TDG_FISICOS = 'TDG FISICOS',
  CDS = 'CDS',
  NORMAS = 'NORMAS'
}

export interface InventoryItem {
  id: string;
  barcode: string;
  timestamp: number; // Unix timestamp
  synced: boolean;
}

export interface InventorySession {
  id: string;
  name: string;
  sede: Sede;
  coleccion: Coleccion;
  createdAt: number;
  updatedAt: number;
  items: InventoryItem[];
}

export type ScreenName = 'HOME' | 'NEW_SESSION' | 'SCANNER' | 'DETAILS';