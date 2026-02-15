import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import LogoutButton from "./LogoutButton";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          PromoQR
        </Link>
        <nav className="flex items-center gap-4">
          {user && (
            <Link to="/messages" className="text-sm text-gray-600">
              Mensajes
            </Link>
          )}
          {user && (
            <Link to="/promotions" className="text-sm text-gray-600">
              Promociones
            </Link>
          )}
          {user && (
            <Link to="/scan" className="text-sm text-gray-600">
              Escanear
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className="text-sm text-gray-600">
              Admin
            </Link>
          )}
          {user ? (
            <LogoutButton />
          ) : (
            <Link to="/login" className="text-sm text-gray-600">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
