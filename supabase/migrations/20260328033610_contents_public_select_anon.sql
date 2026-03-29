/*
  # Fase A: contenido publicado visible sin sesión (landing / novedades)

  Política SELECT para rol `anon` alineada con la de usuarios autenticados:
  solo filas `published` y fecha de publicación ya efectiva.
*/

CREATE POLICY "Anyone can view published content"
  ON public.contents
  FOR SELECT
  TO anon
  USING (
    status = 'published'
    AND (published_at IS NULL OR published_at <= now())
  );
