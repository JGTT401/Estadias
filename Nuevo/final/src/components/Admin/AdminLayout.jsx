// src/components/Admin/AdminLayout.jsx
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Shared/Navbar";
import { supabase } from "../../services/supabaseClient";

export default function AdminLayout({ profile }) {
  const nav = useNavigate();
  async function handleLogout() {
    await supabase.auth.signOut();
    nav("/login");
  }

  const items = [
    { to: "/admin/home", label: "Home" },
    { to: "/admin/messages", label: "Mensajes" },
    { to: "/admin/promotions", label: "Promociones" },
    { to: "/admin/scan", label: "Escanear QR" },
  ];

  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar items={items} />
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <p className="text-sm text-neutral-600">
            Hola, <span className="font-medium text-neutral-900">{profile.email}</span>
          </p>
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-neutral-200 text-neutral-800 hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="card-neutral p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
