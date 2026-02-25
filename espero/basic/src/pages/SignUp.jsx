import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState(null);
  const navigate = useNavigate();

  // Helper para bloquear envíos por X segundos
  function blockForSeconds(seconds) {
    const until = Date.now() + seconds * 1000;
    setBlockedUntil(until);
    setTimeout(() => setBlockedUntil(null), seconds * 1000);
  }

  async function handleSignUp(e) {
    e.preventDefault();
    if (loading) return;
    if (blockedUntil && Date.now() < blockedUntil) return;

    // Validaciones básicas
    if (!email || !password) {
      alert("Ingresa correo y contraseña.");
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        // Manejo específico para rate limit
        if (error.status === 429) {
          // Si el servidor devuelve retry info en el mensaje, podríamos parsearlo; por defecto bloqueamos 60s
          const defaultSeconds = 60;
          blockForSeconds(defaultSeconds);
          alert(
            `Demasiadas solicitudes. Intenta de nuevo en ${defaultSeconds} segundos.`,
          );
        } else {
          alert(error.message || "Error al crear la cuenta.");
        }
        setLoading(false);
        return;
      }

      // Si el usuario fue creado (puede requerir confirmación por email)
      if (data?.user) {
        try {
          // Actualiza el perfil (si la política RLS lo permite)
          await supabase
            .from("profiles")
            .update({ full_name: fullName })
            .eq("id", data.user.id);
        } catch (profileErr) {
          // No bloqueante: solo informar en consola y continuar
          console.error("No se pudo actualizar profile:", profileErr);
        }
      }

      alert("Cuenta creada. Revisa tu correo para confirmar (si aplica).");
      navigate("/login");
    } catch (err) {
      console.error("Error inesperado en signup:", err);
      alert("Ocurrió un error inesperado. Intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }

  const isBlocked = blockedUntil && Date.now() < blockedUntil;
  const blockedSecondsLeft = isBlocked
    ? Math.ceil((blockedUntil - Date.now()) / 1000)
    : 0;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSignUp}
        className="bg-white p-8 rounded shadow w-full max-w-md"
      >
        <h2 className="text-2xl mb-4">Crear cuenta</h2>

        <label className="block mb-2">Nombre completo</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Tu nombre"
        />

        <label className="block mb-2">Correo</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="correo@ejemplo.com"
          type="email"
        />

        <label className="block mb-2">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Contraseña segura"
        />

        <button
          type="submit"
          disabled={loading || isBlocked}
          className={`w-full p-2 rounded text-white ${
            loading || isBlocked
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600"
          }`}
        >
          {loading
            ? "Creando cuenta..."
            : isBlocked
              ? `Intenta en ${blockedSecondsLeft}s`
              : "Crear cuenta"}
        </button>

        <p className="mt-4 text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-blue-600">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
