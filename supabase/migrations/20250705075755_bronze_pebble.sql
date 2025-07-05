-- =============================================
-- CRÉATION DE LA FONCTION exec_sql
-- =============================================
-- Cette fonction est nécessaire pour exécuter du SQL dynamique
-- depuis l'application frontend

CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Exécuter le SQL fourni
  EXECUTE sql INTO result;
  
  -- Retourner le résultat
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, retourner l'erreur
    RETURN json_build_object(
      'error', true,
      'message', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;