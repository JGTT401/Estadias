import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function MessagesUser() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      setMessages(data || []);
    }
    load();
  }, []);

  return (
    <div>
      <h3 className="text-xl mb-4">Mensajes</h3>
      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="p-4 border rounded bg-white">
            <h4 className="font-semibold">{m.title}</h4>
            <p className="text-sm text-gray-600">
              {new Date(m.created_at).toLocaleString()}
            </p>
            <p className="mt-2">{m.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
