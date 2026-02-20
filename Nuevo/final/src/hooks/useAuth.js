import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.getSession().then((res) => {
      setUser(res.data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!error) setProfile(data);
    })();
  }, [user]);

  return { user, profile, loading };
}
