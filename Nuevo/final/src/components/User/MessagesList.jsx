import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function MessagesList() {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    fetch();
  }, []);

  async function fetch() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages(data || []);
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Mensajes</h3>
      {messages.map((m) => (
        <div key={m.id} className="mb-2 p-2 border rounded">
          <div className="font-semibold">{m.title}</div>
          <div className="text-sm">{m.body}</div>
        </div>
      ))}
    </div>
  );
}
