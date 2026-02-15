import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthProvider";

export default function MessagesList() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false });
      if (error) console.error(error);
      else setMessages(data || []);
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) return <div className="p-6">Cargando mensajes...</div>;
  if (!messages.length) return <div className="p-6">No tienes mensajes.</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Mensajes</h2>
      <ul className="space-y-3">
        {messages.map((m) => (
          <li key={m.id} className="border rounded p-3 bg-white">
            <div className="text-sm text-gray-500">
              {new Date(m.created_at).toLocaleString()}
            </div>
            <div className="mt-1">{m.content}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
