import React, { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function PromotionsAdmin() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [requiredVisits, setRequiredVisits] = useState(1);

  async function createPromotion(e) {
    e.preventDefault();
    const user = await supabase.auth.getUser();
    const { error } = await supabase.from("promotions").insert([
      {
        title,
        content,
        required_visits: Number(requiredVisits),
        created_by: user.data.user.id,
      },
    ]);
    if (error) return alert(error.message);
    setTitle("");
    setContent("");
    setRequiredVisits(1);
    alert("Promoción creada.");
  }

  return (
    <div>
      <h3 className="text-xl mb-4">Crear Promoción</h3>
      <form onSubmit={createPromotion} className="max-w-lg">
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
        <input
          type="number"
          value={requiredVisits}
          onChange={(e) => setRequiredVisits(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          min="1"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Crear
        </button>
      </form>
    </div>
  );
}
