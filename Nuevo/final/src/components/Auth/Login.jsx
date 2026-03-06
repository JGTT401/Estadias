import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    if (loading) return; // evita envíos dobles
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      // opcional: esperar a que data.user exista
      if (data?.user) {
        nav("/");
      }
    } catch (err) {
      console.error("Error inesperado en login:", err);
      alert("Ocurrió un error. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center px-3 py-6 sm:px-4 sm:py-12">
      <div className="max-w-md mx-auto w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 sm:p-6 lg:p-8">
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
          Iniciar sesión
        </h1>
        <p className="text-neutral-500 text-sm mt-1 mb-6">
          Accede a tu cuenta
        </p>
        <form onSubmit={handleLogin} autoComplete="on" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input-neutral"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input-neutral"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn-neutral w-full py-3"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿No tienes cuenta?{" "}
          <Link to="/signup" className="font-medium text-neutral-700 hover:text-neutral-900 underline underline-offset-2">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
