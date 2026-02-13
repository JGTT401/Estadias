import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import Login from "./components/Login";
import Register from "./components/Register";
import QRScanner from "./components/QRScanner";
import PromotionPage from "./components/PromotionPage";
import AdminPanel from "./components/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <nav>
          <Link to="/">Home</Link> | <Link to="/scan">Escanear QR</Link> |{" "}
          <Link to="/admin">Admin</Link>
        </nav>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                Bienvenido. <Link to="/login">Entrar</Link>{" "}
                <Link to="/register">Registrar</Link>
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
          <Route path="/promotion/:id" element={<PromotionPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
