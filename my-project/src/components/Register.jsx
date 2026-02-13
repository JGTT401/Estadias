import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);
    await supabase
      .from("profiles")
      .insert([{ id: data.user.id, email, role: "user" }]);
    alert("Revisa tu correo para confirmar.");
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Crear cuenta
        </h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
            type="email"
            required
          />
          <input
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            type="password"
            required
          />
          <button className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition">
            Registrar
          </button>
        </form>
      </div>
    </div>
  );
}
