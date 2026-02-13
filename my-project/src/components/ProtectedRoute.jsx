// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  // Mientras se carga la sesión inicial, muestra un loader o nada
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Cargando sesión...</p>
      </div>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si requiere admin y el usuario no lo es, redirigir al home
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Si pasa todas las validaciones, renderizar el contenido protegido
  return children;
}
