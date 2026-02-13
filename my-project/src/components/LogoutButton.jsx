// src/components/LogoutButton.jsx
import React, { useState, useContext } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthProvider";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext); // opcional: limpiar contexto

  async function handleLogout() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // limpiar estado local/contexto si aplica
      if (setUser) setUser(null);
      // redirigir al login
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error", err);
      alert("No se pudo cerrar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50
                 disabled:opacity-60 disabled:cursor-not-allowed transition"
      aria-label="Cerrar sesión"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 16l4-4m0 0l-4-4m4 4H7"
        />
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 8v8"
        />
      </svg>
      {loading ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
