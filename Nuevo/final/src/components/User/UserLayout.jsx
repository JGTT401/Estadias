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
    <div className="min-h-screen bg-brand-surface">
      <Navbar items={items} />
      <header className="bg-brand-cream/90 border-b border-brand-800/15 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-3">
          <p className="text-xs sm:text-sm text-brand-900/70 min-w-0 truncate">
            Hola,{" "}
            <span className="font-medium text-brand-950">
              {profile.email}
            </span>
          </p>
          <button
            type="button"
            className="flex-shrink-0 px-3 py-2 sm:px-4 rounded-lg text-sm font-medium bg-white border border-brand-800/20 text-brand-900 hover:bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[2.75rem]"
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
