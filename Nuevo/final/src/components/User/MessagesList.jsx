import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function MessagesList() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (!cancelled) setMessages(data ?? []);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-full overflow-hidden">
      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1">Mensajes</h3>
      <p className="text-neutral-500 text-sm mb-3 sm:mb-4">Comunicados del equipo.</p>
      {messages.length === 0 ? (
        <p className="text-neutral-500 py-8 text-center">No hay mensajes aún.</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className="card-neutral p-4">
              <p className="font-medium text-neutral-900">{m.title}</p>
              <p className="text-sm text-neutral-600 mt-1 whitespace-pre-wrap">{m.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
