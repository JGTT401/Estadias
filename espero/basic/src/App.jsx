import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import AdminHome from "./pages/Admin/AdminHome";
import UserHome from "./pages/User/UserHome";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const { session, profile, loading } = useAuth();

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      <Route
        path="/"
        element={
          <ProtectedRoute session={session}>
            <Home profile={profile} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute
            session={session}
            requireRole="admin"
            profile={profile}
          >
            <AdminHome />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/*"
        element={
          <ProtectedRoute
            session={session}
            requireRole="user"
            profile={profile}
          >
            <UserHome />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
