-- Ejecuta este SQL en Supabase: SQL Editor
-- CORRIGE el error 500 causado por recursión infinita en las políticas RLS

-- 1. ELIMINAR políticas que causan recursión (si las agregaste antes)
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles visits" ON public.profiles;

-- 2. Función auxiliar que evita recursión (SECURITY DEFINER omite RLS dentro de la función)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. Política para que usuarios lean su propio perfil (necesaria para useAuth)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- 4. Política para que admins lean todos los perfiles (para escanear QR)
CREATE POLICY "Admins can read all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin());

-- 5. Trigger: al insertar en scans, incrementar visitas en profiles automáticamente
CREATE OR REPLACE FUNCTION public.on_scan_insert_increment_visits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET visits = COALESCE(visits, 0) + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_increment_visits_on_scan ON public.scans;
CREATE TRIGGER trigger_increment_visits_on_scan
  AFTER INSERT ON public.scans
  FOR EACH ROW
  EXECUTE PROCEDURE public.on_scan_insert_increment_visits();

-- 6. Política para que admins inserten en la tabla scans (registro de escaneos)
DROP POLICY IF EXISTS "Admins can insert scans" ON public.scans;
CREATE POLICY "Admins can insert scans"
ON public.scans
FOR INSERT
WITH CHECK (public.is_admin());
