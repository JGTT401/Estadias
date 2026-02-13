import React, { useState, useContext, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { AuthContext } from "./AuthProvider";
import QRGenerator from "./QRGenerator";

export default function AdminPanel() {
  const { profile } = useContext(AuthContext);
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [messages, setMessages] = useState([]);
  const [vpTitle, setVpTitle] = useState("");
  const [vpDesc, setVpDesc] = useState("");
  const [rewardText, setRewardText] = useState("");
  const [rewardCode, setRewardCode] = useState("");
  const [rewardQty, setRewardQty] = useState(0);
  const [visitPoints, setVisitPoints] = useState([]);

  useEffect(() => {
    fetchMessages();
    fetchVisitPoints();
  }, []);

  async function fetchMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages(data || []);
  }

  async function createMessage(e) {
    e.preventDefault();
    if (!msgTitle || !msgBody) return alert("Título y cuerpo son obligatorios");
    await supabase
      .from("messages")
      .insert([{ title: msgTitle, body: msgBody, created_by: profile.id }]);
    setMsgTitle("");
    setMsgBody("");
    fetchMessages();
  }

  async function fetchVisitPoints() {
    const { data } = await supabase
      .from("visit_points")
      .select("*")
      .order("created_at", { ascending: false });
    setVisitPoints(data || []);
  }

  async function createVisitPoint(e) {
    e.preventDefault();
    const payload = {
      title: vpTitle,
      description: vpDesc,
      reward_text: rewardText || null,
      reward_code: rewardCode || null,
      reward_quantity: Number(rewardQty) || 0,
      created_by: profile.id,
    };
    const { error } = await supabase.from("visit_points").insert([payload]);
    if (error) return alert(error.message);
    setVpTitle("");
    setVpDesc("");
    setRewardText("");
    setRewardCode("");
    setRewardQty(0);
    fetchVisitPoints();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Crear mensaje</h3>
            <form onSubmit={createMessage} className="space-y-3">
              <input
                className="w-full px-3 py-2 border rounded"
                value={msgTitle}
                onChange={(e) => setMsgTitle(e.target.value)}
                placeholder="Título"
              />
              <textarea
                className="w-full px-3 py-2 border rounded"
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                placeholder="Cuerpo"
              />
              <button className="px-4 py-2 bg-primary text-white rounded">
                Enviar
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Mensajes recientes</h3>
            <div className="space-y-4">
              {messages.map((m) => (
                <div key={m.id} className="p-4 border rounded">
                  <div className="font-medium">{m.title}</div>
                  <div className="text-sm text-gray-600">{m.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold mb-3">
              Crear punto de visita
            </h3>
            <form onSubmit={createVisitPoint} className="space-y-3">
              <input
                className="w-full px-3 py-2 border rounded"
                value={vpTitle}
                onChange={(e) => setVpTitle(e.target.value)}
                placeholder="Título del punto"
              />
              <input
                className="w-full px-3 py-2 border rounded"
                value={vpDesc}
                onChange={(e) => setVpDesc(e.target.value)}
                placeholder="Descripción (opcional)"
              />
              <input
                className="w-full px-3 py-2 border rounded"
                value={rewardText}
                onChange={(e) => setRewardText(e.target.value)}
                placeholder="Texto recompensa (opcional)"
              />
              <input
                className="w-full px-3 py-2 border rounded"
                value={rewardCode}
                onChange={(e) => setRewardCode(e.target.value)}
                placeholder="Código recompensa (opcional)"
              />
              <input
                className="w-full px-3 py-2 border rounded"
                type="number"
                value={rewardQty}
                onChange={(e) => setRewardQty(e.target.value)}
                placeholder="Cantidad (0 = ilimitado)"
              />
              <button className="px-4 py-2 bg-primary text-white rounded">
                Crear punto
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Puntos</h3>
            <div className="space-y-3">
              {visitPoints.map((vp) => (
                <div
                  key={vp.id}
                  className="p-3 border rounded flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{vp.title}</div>
                    <div className="text-sm text-gray-500">
                      {vp.description}
                    </div>
                    <div className="text-xs text-gray-400">
                      {vp.reward_text
                        ? `Recompensa: ${vp.reward_text}`
                        : "Sin recompensa"}
                    </div>
                  </div>
                  <QRGenerator visitPoint={vp} />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
