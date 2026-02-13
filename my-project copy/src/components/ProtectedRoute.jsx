import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthProvider";

export default function ProtectedRoute({ children, requireAdmin }) {
  const { user, profile, loading } = useContext(AuthContext);
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && profile?.role !== "admin")
    return <div>No autorizado</div>;
  return children;
}
