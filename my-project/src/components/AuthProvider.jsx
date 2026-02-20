import React, { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data?.session?.user ?? null;
        if (sessionUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", sessionUser.id)
            .single();
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
      }
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[Auth] onAuthStateChange", event, session);
        if (event === "SIGNED_OUT") {
          setUser(null);
          return; // no queries si no hay sesión
        }
        if (session?.user) {
          supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()
            .then(({ data: profile }) => {
              setUser({ ...session.user, role: profile?.role ?? "user" });
            })
            .catch((err) => {
              console.error("[Auth] listener fetch profile error:", err);
              setUser({ ...session.user, role: "user" });
            });
        }
      },
    );

    return () => {
      listener?.subscription?.unsubscribe?.();
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
