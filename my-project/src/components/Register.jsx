import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) return alert(error.message);

    // Crear perfil con rol 'user' por defecto
    await supabase
      .from("profiles")
      .insert([{ id: data.user.id, email, role: "user" }]);
    alert("Revisa tu correo para confirmar. Perfil creado.");
  }

  return (
    <form onSubmit={handleRegister}>
      <h2>Registro</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        type="password"
      />
      <button type="submit">Registrar</button>
    </form>
  );
}
