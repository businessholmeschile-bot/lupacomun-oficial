-- SCRIPT DE CONFIGURACIÓN LUPACOMÚN
-- Ejecuta esto en el SQL Editor de tu Dashboard de Supabase

-- 1. Habilitar extensión UUID (si no está activa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Crear la tabla de comentarios
CREATE TABLE IF NOT EXISTS dashboard_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id TEXT NOT NULL,
    content TEXT NOT NULL,
    pos_x FLOAT NOT NULL, -- Posición horizontal en %
    pos_y FLOAT NOT NULL, -- Posición vertical en %
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE dashboard_comments ENABLE ROW LEVEL SECURITY;

-- 4. Crear política de acceso público (Lectura/Escritura)
-- NOTA: En producción deberías restringir esto a usuarios autenticados.
CREATE POLICY "Permitir todo a usuarios anónimos" 
ON dashboard_comments 
FOR ALL 
USING (true) 
WITH CHECK (true);
