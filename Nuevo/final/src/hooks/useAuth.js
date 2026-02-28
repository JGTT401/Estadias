import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      setUser(res.data.session?.user ?? null);
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
      queueMicrotask(() => {
        setProfile(null);
        setLoading(false);
      });
      return;
    }
    queueMicrotask(() => setLoading(true));
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        setProfile(error ? null : data);
        setLoading(false);
      });
  }, [user]);

  return { user, profile, loading };
}
