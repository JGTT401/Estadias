import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function init() {
      console.log("[Auth] init: obteniendo sesión...");
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log("[Auth] getSession data:", data, "error:", error);
        const sessionUser = data?.session?.user ?? null;
        console.log("[Auth] sessionUser:", sessionUser);
        if (sessionUser) {
          const { data: profile, error: pErr } = await supabase
            .from("profiles")
            .select("role, created_at")
            .eq("id", sessionUser.id)
            .single();
          console.log("[Auth] profile:", profile, "pErr:", pErr);
          if (mounted)
            setUser({ ...sessionUser, role: profile?.role ?? "user" });
        } else {
          if (mounted) setUser(null);
        }
      } catch (err) {
        console.error("[Auth] init error:", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
        console.log("[Auth] init finished, loading=false");
      }
    }
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("[Auth] onAuthStateChange", _event, session);
        const sessionUser = session?.user ?? null;
        if (sessionUser) {
          supabase
            .from("profiles")
            .select("role")
            .eq("id", sessionUser.id)
            .single()
            .then(({ data: profile, error }) => {
              console.log("[Auth] listener profile:", profile, "err:", error);
              setUser({ ...sessionUser, role: profile?.role ?? "user" });
            })
            .catch((e) =>
              console.error("[Auth] listener fetch profile error:", e),
            );
        } else {
          setUser(null);
        }
      },
    );

    return () => {
      listener?.subscription?.unsubscribe?.();
      mounted = false;
    };
  }, []);

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
