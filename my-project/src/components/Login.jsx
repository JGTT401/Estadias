import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return alert(error.message);
    // Sesión iniciada; AuthProvider se encargará de cargar perfil
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Iniciar sesión</h2>
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
      <button type="submit">Entrar</button>
    </form>
  );
}
