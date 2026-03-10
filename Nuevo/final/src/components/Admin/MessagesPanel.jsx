import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useToast } from "../../context/ToastContext";

export default function MessagesPanel({ adminId }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  async function sendMessage() {
    const titleTrim = (title ?? "").trim();
    const bodyTrim = (body ?? "").trim();
    if (!titleTrim || !bodyTrim) {
      setError("Completa título y mensaje para enviar.");
      return;
    }
    if (!adminId) {
      toast.error("Error de sesión: no se pudo identificar al administrador.");
      return;
    }

    setError("");
    setLoading(true);

    const { error: insertError } = await supabase
      .from("messages")
      .insert({ admin_id: adminId, title: titleTrim, body: bodyTrim });

    if (insertError) {
      toast.error(insertError.message);
      setLoading(false);
      return;
    }

    setTitle("");
    setBody("");
    toast.success("Mensaje enviado a todos los usuarios");
    setLoading(false);
  }

  return (
    <div className="max-w-full overflow-hidden">
      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1">Enviar mensaje</h3>
      <p className="text-neutral-500 text-sm mb-3 sm:mb-4">El mensaje será visible para todos los usuarios.</p>
      <div className="space-y-4 w-full max-w-xl">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="msg-title" className="block text-sm font-medium text-neutral-700 mb-1.5">Título</label>
          <input
            id="msg-title"
            className="input-neutral"
            placeholder="Asunto del mensaje"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(""); }}
          />
        </div>
        <div>
          <label htmlFor="msg-body" className="block text-sm font-medium text-neutral-700 mb-1.5">Mensaje</label>
          <textarea
            id="msg-body"
            className="input-neutral min-h-[120px] resize-y"
            placeholder="Escribe el contenido..."
            value={body}
            onChange={(e) => { setBody(e.target.value); setError(""); }}
            rows={4}
          />
        </div>
        <button
          type="button"
          className="btn-neutral w-full sm:w-auto min-h-[2.75rem]"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar a todos"}
        </button>
      </div>
    </div>
  );
}
