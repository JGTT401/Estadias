import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const userId = data.user.id;
      const qr = uuidv4();
      const profileData = {
        id: userId,
        email,
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
        alert(
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
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Crear cuenta</h1>
        <p className="text-neutral-500 text-sm mt-1 mb-6">Regístrate para empezar</p>
        {error && (
          <div className="mb-4 p-3 bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSignup} autoComplete="on" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">Correo</label>
            <input
              id="email"
              type="email"
              name="email"
              className="input-neutral"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              className="input-neutral"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <button type="submit" className="btn-neutral w-full py-3" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-neutral-700 hover:text-neutral-900 underline underline-offset-2">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
