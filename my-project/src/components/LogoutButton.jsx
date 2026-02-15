import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function LogoutButton() {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    setLoading(true);
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      alert("No se pudo cerrar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-3 py-2 rounded bg-white border text-sm"
    >
      {loading ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
