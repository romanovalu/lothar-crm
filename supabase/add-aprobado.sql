-- Agregar campo aprobado a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aprobado boolean NOT NULL DEFAULT false;

-- Los usuarios existentes quedan aprobados automáticamente
UPDATE profiles SET aprobado = true;

-- Actualizar política RLS: usuarios no aprobados no pueden leer datos
-- (el middleware se encarga, pero esto es defensa extra)
