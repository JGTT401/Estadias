import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function MessagesPanel({ adminId }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function sendMessage() {
    if (!title || !body) return alert("Completa título y mensaje");
    if (!adminId) return alert("Error de sesión: no se pudo identificar al administrador.");
    const { error } = await supabase
      .from("messages")
      .insert({ admin_id: adminId, title, body });
    if (error) return alert(error.message);
    setTitle("");
    setBody("");
    alert("Mensaje enviado a todos los usuarios");
  }

  return (
    <div className="max-w-full overflow-hidden">
      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1">Enviar mensaje</h3>
      <p className="text-neutral-500 text-sm mb-3 sm:mb-4">El mensaje será visible para todos los usuarios.</p>
      <div className="space-y-4 w-full max-w-xl">
        <div>
          <label htmlFor="msg-title" className="block text-sm font-medium text-neutral-700 mb-1.5">Título</label>
          <input
            id="msg-title"
            className="input-neutral"
            placeholder="Asunto del mensaje"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="msg-body" className="block text-sm font-medium text-neutral-700 mb-1.5">Mensaje</label>
          <textarea
            id="msg-body"
            className="input-neutral min-h-[120px] resize-y"
            placeholder="Escribe el contenido..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
          />
        </div>
        <button type="button" className="btn-neutral w-full sm:w-auto min-h-[2.75rem]" onClick={sendMessage}>
          Enviar a todos
        </button>
      </div>
    </div>
  );
}
