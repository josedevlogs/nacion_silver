/*
  # Actualizar tabla benefits para permitir created_by nullable temporalmente
  
  ## Descripción
  Permite que created_by sea nullable para datos de seed iniciales
*/

-- Hacer created_by nullable temporalmente
ALTER TABLE benefits ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE challenges ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE contents ALTER COLUMN created_by DROP NOT NULL;