import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  session,
  requireRole,
  profile,
}) {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  if (requireRole && profile && profile.role !== requireRole) {
    // If role mismatch, redirect to home
    return <Navigate to="/" replace />;
  }
  return children;
}
