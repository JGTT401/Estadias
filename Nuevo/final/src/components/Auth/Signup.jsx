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
          "Cuenta creada pero hubo un error al completar el perfil. Contacta soporte."
        );
      } else {
        alert("Cuenta creada correctamente. Revisa tu correo si tienes confirmación activada.");
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
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Registro</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSignup} autoComplete="on">
        <input
          type="email"
          name="email"
          className="w-full p-2 border mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          type="password"
          name="password"
          className="w-full p-2 border mb-3"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
      <div className="mt-4 text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-blue-600">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
