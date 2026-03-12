import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

function getSignupErrorMessage(error) {
  const msg = error?.message?.toLowerCase() ?? "";
  if (
    msg.includes("user already registered") ||
    msg.includes("already been registered")
  ) {
    return "Ya existe una cuenta con este correo. Inicia sesión o usa otro correo.";
  }
  if (msg.includes("password")) {
    return "La contraseña no cumple los requisitos. Usa al menos 6 caracteres.";
  }
  if (msg.includes("invalid email")) {
    return "Introduce un correo electrónico válido.";
  }
  return error?.message ?? "Error al crear la cuenta. Intenta de nuevo.";
}

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();
  const toast = useToast();

  async function handleSignup(e) {
    e.preventDefault();
    if (loading) return;
    setError("");

    const emailTrim = email.trim();
    const passwordTrim = password.trim();

    if (!emailTrim && !passwordTrim) {
      setError("Ingresa tu correo electrónico y contraseña para registrarte.");
      return;
    }
    if (!emailTrim) {
      setError("Ingresa tu correo electrónico.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    if (!passwordTrim) {
      setError("Ingresa una contraseña.");
      return;
    }
    if (passwordTrim.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailTrim,
        password: passwordTrim,
      });
      if (signUpError) {
        setError(getSignupErrorMessage(signUpError));
        setLoading(false);
        return;
      }

      const userId = data.user.id;
      const qr = uuidv4();
      const profileData = {
        id: userId,
        email: emailTrim,
        role: "user",
        qr_code: qr,
        visits: 0,
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(profileData, {
          onConflict: "id",
        });

      if (profileError) {
        console.error("Error al crear perfil:", profileError);
        setError(
          "Cuenta creada pero hubo un error al completar el perfil. Contacta soporte.",
        );
      } else {
        toast.success(
          "Cuenta creada correctamente. Revisa tu correo si tienes confirmación activada.",
        );
        nav("/login");
      }
    } catch (err) {
      console.error("Error inesperado en registro:", err);
      setError("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center px-3 py-6 sm:px-4 sm:py-12">
      <div className="max-w-md mx-auto w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 sm:p-6 lg:p-8">
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
          Crear cuenta
        </h1>
        <p className="text-neutral-500 text-sm mt-1 mb-6">
          Regístrate para empezar
        </p>
        <form onSubmit={handleSignup} autoComplete="on" className="space-y-4">
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
              type="email"
              name="email"
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
              type="password"
              name="password"
              className="input-neutral"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-neutral-500">Mínimo 6 caracteres</p>
          </div>
          <button
            type="submit"
            className="btn-neutral w-full py-3"
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="font-medium text-neutral-700 hover:text-neutral-900 underline underline-offset-2"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
