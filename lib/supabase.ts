import { createClient } from '@supabase/supabase-js';

// Frontend-only fallback: allows build/deploy without real Supabase env vars.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'public-anon-key-placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  monto_pactado: number;
  total_adeudo: number;
  created_at: string;
}

export interface Expediente {
  id: string;
  numero_expediente: string;
  partes: string;
  juzgado: string;
  estatus: string;
  notas: string;
  cliente_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Movimiento {
  id: string;
  expediente_id: string;
  fecha: string;
  tipo: string;
  descripcion: string;
  created_at: string;
}

export interface ClienteMovimiento {
  id: string;
  cliente_id: string;
  tipo: 'cargo' | 'abono';
  monto: number;
  descripcion?: string;
  created_at: string;
}

export interface TribunalLaboral {
  id: string;
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
  hoja_no_conciliacion?: boolean;
  created_at: string;
}
