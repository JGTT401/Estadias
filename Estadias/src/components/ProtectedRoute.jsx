// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function ProtectedRoute({ component: Component, isAdmin }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere ser admin, verifica si el usuario tiene el rol de admin
  if (isAdmin && user.app_metadata?.roles !== "admin") {
    return (
      <div>
        <h1>No tienes permisos para acceder a esta página.</h1>
      </div>
    );
  }

  return <Component />;
}

export default ProtectedRoute;
