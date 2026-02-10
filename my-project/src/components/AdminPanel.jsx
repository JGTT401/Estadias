import React, { useState, useContext, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { AuthContext } from "./AuthProvider";
import QRGenerator from "./QRGenerator";

export default function AdminPanel() {
  const { profile } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [promotions, setPromotions] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPromotions();
  }, []);

  async function fetchPromotions() {
    const { data } = await supabase
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false });
    setPromotions(data || []);
  }

  async function createPromotion(e) {
    e.preventDefault();
    const { data, error } = await supabase
      .from("promotions")
      .insert([
        {
          title,
          description,
          code,
          created_by: profile.id,
        },
      ])
      .select()
      .single();
    if (error) return alert(error.message);
    setTitle("");
    setDescription("");
    setCode("");
    fetchPromotions();
  }

  async function sendMessageToAll(e) {
    e.preventDefault();
    // Insertar mensaje
    await supabase
      .from("messages")
      .insert([{ title: "Promoción", body: message, created_by: profile.id }]);
    setMessage("");
    alert("Mensaje enviado (guardado en tabla messages).");
    // Para notificaciones reales, integrar Realtime o push notifications
  }

  return (
    <div>
      <h2>Admin Panel</h2>

      <section>
        <h3>Crear promoción</h3>
        <form onSubmit={createPromotion}>
          <input
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            placeholder="Código (único)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <textarea
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit">Crear</button>
        </form>
      </section>

      <section>
        <h3>Promociones</h3>
        {promotions.map((p) => (
          <div
            key={p.id}
            style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}
          >
            <strong>{p.title}</strong>
            <p>{p.description}</p>
            <QRGenerator promotion={p} />
          </div>
        ))}
      </section>

      <section>
        <h3>Enviar mensaje a usuarios</h3>
        <form onSubmit={sendMessageToAll}>
          <textarea
            placeholder="Mensaje"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit">Enviar</button>
        </form>
      </section>
    </div>
  );
}
