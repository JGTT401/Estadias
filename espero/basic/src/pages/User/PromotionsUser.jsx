import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function PromotionsUser() {
  const [promotions, setPromotions] = useState([]);
  const [visitsCount, setVisitsCount] = useState(0);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function load() {
      const s = await supabase.auth.getSession();
      const userId = s.data.session.user.id;
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(p);
      const { data: v } = await supabase
        .from("visits")
        .select("*")
        .eq("user_id", userId);
      setVisitsCount(v?.length || 0);
      const { data: promos } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false });
      setPromotions(promos || []);
    }
    load();
  }, []);

  return (
    <div>
      <h3 className="text-xl mb-4">Promociones</h3>
      <p className="mb-4">
        Visitas registradas: <strong>{visitsCount}</strong>
      </p>
      <div className="space-y-4">
        {promotions.map((promo) => {
          const unlocked = visitsCount >= promo.required_visits;
          return (
            <div key={promo.id} className="p-4 border rounded bg-white">
              <h4 className="font-semibold">{promo.title}</h4>
              <p className="text-sm text-gray-600">
                Necesita {promo.required_visits} visitas
              </p>
              <p className="mt-2">{promo.content}</p>
              <p
                className={`mt-2 font-semibold ${unlocked ? "text-green-600" : "text-gray-500"}`}
              >
                {unlocked ? "¡Desbloqueada!" : "No alcanzada"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
