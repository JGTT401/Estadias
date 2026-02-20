import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function MessagesPanel({ adminId }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function sendMessage() {
    if (!title || !body) return alert("Completa título y mensaje");
    const { error } = await supabase
      .from("messages")
      .insert({ admin_id: adminId, title, body });
    if (error) return alert(error.message);
    setTitle("");
    setBody("");
    alert("Mensaje enviado a todos los usuarios");
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Enviar mensaje</h3>
      <input
        className="w-full p-2 border mb-2"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full p-2 border mb-2"
        placeholder="Mensaje"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-3 py-1 rounded"
        onClick={sendMessage}
      >
        Enviar
      </button>
    </div>
  );
}
