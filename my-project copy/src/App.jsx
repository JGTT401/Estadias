import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import Login from "./components/Login";
import Register from "./components/Register";
import QRScanner from "./components/QRScanner";
import VisitPage from "./components/VisitPage";
import MessagesList from "./components/MessagesList";
import AdminPanel from "./components/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";

import "./index.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <header className="bg-white shadow">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-primary">
              PromoQR
            </Link>
            <nav className="space-x-4">
              <Link
                className="text-sm text-gray-600 hover:text-primary"
                to="/messages"
              >
                Mensajes
              </Link>
              <Link
                className="text-sm text-gray-600 hover:text-primary"
                to="/scan"
              >
                Escanear
              </Link>
              <Link
                className="text-sm text-gray-600 hover:text-primary"
                to="/admin"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>

        <main>
          <Routes>
            <Route
              path="/"
              element={
                <div className="max-w-4xl mx-auto px-4 py-12">
                  <div className="bg-white rounded-2xl shadow p-8">
                    <h1 className="text-2xl font-semibold">
                      Bienvenido a PromoQR
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Escanea QR para registrar visitas y reclama recompensas.
                    </p>
                  </div>
                </div>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/scan"
              element={
                <ProtectedRoute>
                  <QRScanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/visit/:id"
              element={
                <ProtectedRoute>
                  <VisitPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
