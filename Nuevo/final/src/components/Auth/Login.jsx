import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { Link, useNavigate } from "react-router-dom";

function getLoginErrorMessage(error) {
  const msg = error?.message?.toLowerCase() ?? "";
  if (
    msg.includes("invalid login credentials") ||
    msg.includes("invalid_credentials")
  ) {
    return "Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.";
  }
  if (msg.includes("email not confirmed")) {
    return "Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.";
  }
  if (msg.includes("user not found")) {
    return "No existe una cuenta con este correo.";
  }
  return error?.message ?? "Error al iniciar sesión. Intenta de nuevo.";
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    if (loading) return;
    setError("");

    const emailTrim = email.trim();
    const passwordTrim = password.trim();

    if (!emailTrim && !passwordTrim) {
      setError("Ingresa tu correo electrónico y contraseña para iniciar sesión.");
      return;
    }
    if (!emailTrim) {
      setError("Ingresa tu correo electrónico.");
      return;
    }
    if (!passwordTrim) {
      setError("Ingresa tu contraseña.");
      return;
    }
    if (passwordTrim.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: emailTrim,
          password: passwordTrim,
        });

      if (signInError) {
        setError(getLoginErrorMessage(signInError));
        setLoading(false);
        return;
      }

      if (data?.user) {
        nav("/");
      }
    } catch (err) {
      console.error("Error inesperado en login:", err);
      setError("Ocurrió un error inesperado. Intenta de nuevo.");
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
        <p className="text-neutral-500 text-sm mt-1 mb-6">Accede a tu cuenta</p>
        <form onSubmit={handleLogin} autoComplete="on" className="space-y-4">
          {error && (
            <div
              className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input-neutral"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              autoComplete="email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input-neutral"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
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
          <Link
            to="/signup"
            className="font-medium text-neutral-700 hover:text-neutral-900 underline underline-offset-2"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
