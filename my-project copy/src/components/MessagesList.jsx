import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MessagesList() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
    const subscription = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages(data || []);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Mensajes</h3>
        <div className="space-y-4">
          {messages.map((m) => (
            <article key={m.id} className="p-4 border rounded">
              <h4 className="font-medium">{m.title}</h4>
              <p className="text-gray-600">{m.body}</p>
              <time className="text-xs text-gray-400">
                {new Date(m.created_at).toLocaleString()}
              </time>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
