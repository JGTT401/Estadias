import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);
    const userId = data.user.id;
    const qr = uuidv4();
    await supabase
      .from("profiles")
      .insert({ id: userId, email, role: "user", qr_code: qr });
    alert("Cuenta creada. Revisa tu correo para confirmar si aplica.");
    nav("/login");
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Registro</h2>
      <form onSubmit={handleSignup}>
        <input
          className="w-full p-2 border mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 border mb-3"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-green-600 text-white py-2 rounded">
          Crear cuenta
        </button>
      </form>
    </div>
  );
}
