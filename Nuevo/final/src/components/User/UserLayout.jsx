// src/components/User/UserLayout.jsx
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Shared/Navbar";
import { supabase } from "../../services/supabaseClient";

export default function UserLayout({ profile }) {
  const nav = useNavigate();
  async function handleLogout() {
    await supabase.auth.signOut();
    nav("/login");
  }

  const items = [
    { to: "/user/home", label: "Home" },
    { to: "/user/myqr", label: "Mi QR" },
    { to: "/user/messages", label: "Mensajes" },
    { to: "/user/promotions", label: "Promociones" },
  ];

  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar items={items} />
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-3">
          <p className="text-xs sm:text-sm text-neutral-600 min-w-0 truncate">
            Hola, <span className="font-medium text-neutral-900">{profile.email}</span>
          </p>
          <button
            type="button"
            className="flex-shrink-0 px-3 py-2 sm:px-4 rounded-lg text-sm font-medium bg-neutral-200 text-neutral-800 hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400 min-h-[2.75rem]"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="card-neutral p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
