import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthProvider";

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const [recipientId, setRecipientId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadUsers() {
      setFetchingUsers(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email")
          .order("email", { ascending: true });
        if (error) throw error;
        if (mounted) setUsers(data || []);
      } catch (err) {
        console.error("Error cargando usuarios:", err);
      } finally {
        if (mounted) setFetchingUsers(false);
      }
    }
    if (!authLoading && user?.role === "admin") loadUsers();
    return () => {
      mounted = false;
    };
  }, [user, authLoading]);

  if (authLoading) return <div className="p-6">Cargando sesión...</div>;
  if (!user)
    return <div className="p-6">Inicia sesión para acceder al panel.</div>;
  if (user.role !== "admin") return <div className="p-6">Acceso denegado.</div>;

  async function handleCreateMessage(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const sessionResp = await supabase.auth.getSession();
      console.log("Session before insert:", sessionResp);
      if (!sessionResp?.data?.session) {
        throw new Error("No hay sesión activa. Vuelve a iniciar sesión.");
      }

      const { data, error, status } = await supabase
        .from("messages")
        .insert([{ recipient_id: recipientId, content }]);

      console.log("Insert result:", { data, error, status });
      if (error) throw error;

      alert("Mensaje creado correctamente");
      setRecipientId("");
      setContent("");
    } catch (err) {
      console.error("Insert error full:", err);
      alert("Error al crear mensaje: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Panel Admin</h2>

      <form onSubmit={handleCreateMessage} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Selecciona usuario
          </label>
          <select
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">-- Selecciona un usuario --</option>
            {fetchingUsers && <option> Cargando usuarios... </option>}
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email || u.id}
              </option>
            ))}
          </select>
        </div>

        <textarea
          placeholder="Contenido del mensaje"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          {loading ? "Creando..." : "Crear mensaje"}
        </button>
      </form>
    </div>
  );
}
