import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function PromotionsPanel() {
  const [promotions, setPromotions] = useState([]);
  const [title, setTitle] = useState("");
  const [minVisits, setMinVisits] = useState(0);

  useEffect(() => {
    fetchPromos();
  }, []);

  async function fetchPromos() {
    const { data } = await supabase
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false });
    setPromotions(data || []);
  }

  async function createPromo() {
    if (!title) return alert("Título requerido");
    await supabase
      .from("promotions")
      .insert({ title, description: "", min_visits: minVisits, active: true });
    setTitle("");
    setMinVisits(0);
    fetchPromos();
  }

  async function awardEligible(promo) {
    const { data: users } = await supabase
      .from("profiles")
      .select("id, visits")
      .gte("visits", promo.min_visits);
    for (const u of users || []) {
      await supabase
        .from("user_promotions")
        .upsert(
          { user_id: u.id, promotion_id: promo.id },
          { onConflict: ["user_id", "promotion_id"] },
        );
    }
    alert("Promociones otorgadas a usuarios elegibles");
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Promociones</h3>
      <div className="mb-3">
        <input
          className="p-2 border mr-2"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="p-2 border w-24 mr-2"
          type="number"
          value={minVisits}
          onChange={(e) => setMinVisits(Number(e.target.value))}
        />
        <button
          className="bg-green-600 text-white px-3 rounded"
          onClick={createPromo}
        >
          Crear
        </button>
      </div>
      <ul>
        {promotions.map((p) => (
          <li
            key={p.id}
            className="mb-2 p-2 border flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm">Min visitas: {p.min_visits}</div>
            </div>
            <div>
              <button
                className="bg-yellow-500 text-white px-2 rounded"
                onClick={() => awardEligible(p)}
              >
                Otorgar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
