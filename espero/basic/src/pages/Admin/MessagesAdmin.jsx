import React, { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function MessagesAdmin() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function sendMessage(e) {
    e.preventDefault();
    const user = supabase.auth.getUser();
    const { error } = await supabase
      .from("messages")
      .insert([{ title, content, created_by: (await user).data.user.id }]);
    if (error) return alert(error.message);
    setTitle("");
    setContent("");
    alert("Mensaje enviado a todos los usuarios.");
  }

  return (
    <div>
      <h3 className="text-xl mb-4">Enviar Mensaje</h3>
      <form onSubmit={sendMessage} className="max-w-lg">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="w-full p-2 border rounded mb-2"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Contenido"
          className="w-full p-2 border rounded mb-2"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Enviar
        </button>
      </form>
    </div>
  );
}
