import React, { createContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        setUser(data.session.user);
        fetchProfile(data.session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      },
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  async function fetchProfile(id) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    if (!error) setProfile(data);
    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
