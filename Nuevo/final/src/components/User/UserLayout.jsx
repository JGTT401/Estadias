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
    <div className="min-h-screen bg-gray-50">
      <Navbar items={items} />
      <header className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          Hola, <b>{profile.email}</b>
        </div>
        <div>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={handleLogout}
          >
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-white rounded shadow p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
