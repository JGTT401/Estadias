import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminPanel() {
  const [recipientId, setRecipientId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateMessage(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from("messages")
        .insert([{ recipient_id: recipientId, content }]);
      if (error) throw error;
      alert("Mensaje creado correctamente");
      setRecipientId("");
      setContent("");
    } catch (err) {
      alert("Error al crear mensaje: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Panel Admin</h2>
      <form onSubmit={handleCreateMessage} className="space-y-4">
        <input
          type="text"
          placeholder="Recipient ID (UUID)"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
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
