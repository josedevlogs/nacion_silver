-- Lista de espera desde la landing marketing (sites/landing). Solo INSERT público vía anon; lectura en panel Supabase o service role.

CREATE TABLE public.waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text,
  source text NOT NULL DEFAULT 'landing'
);

CREATE UNIQUE INDEX waitlist_signups_email_key ON public.waitlist_signups (lower(trim(email)));

COMMENT ON TABLE public.waitlist_signups IS 'Inscripciones waitlist landing; RLS permite solo INSERT anon con source=landing';

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Inserción anónima solo con origen landing (evita filas arbitrarias desde el cliente)
CREATE POLICY "waitlist_insert_landing_only"
  ON public.waitlist_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    source = 'landing'
    AND email IS NOT NULL
    AND length(trim(email)) >= 5
    AND strpos(trim(email), '@') > 1
  );

GRANT INSERT ON TABLE public.waitlist_signups TO anon, authenticated;
