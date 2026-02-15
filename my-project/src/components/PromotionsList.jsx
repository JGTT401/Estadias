import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthProvider";

export default function PromotionsList() {
  const { user } = useAuth();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      // ejemplo: promociones desbloqueadas por reward_claims o por visits
      const { data, error } = await supabase
        .from("promotions")
        .select("*, reward_claims(id, user_id)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else {
        // filtrar por desbloqueadas: si reward_claims contiene user_id igual al user.id
        const unlocked = (data || []).filter((p) => {
          const claims = p.reward_claims || [];
          return claims.some((c) => c.user_id === user.id);
        });
        setPromos(unlocked);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) return <div className="p-6">Cargando promociones...</div>;
  if (!promos.length)
    return <div className="p-6">No tienes promociones desbloqueadas.</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Promociones desbloqueadas</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promos.map((p) => (
          <li key={p.id} className="border rounded p-4 bg-white">
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{p.description}</p>
            <div className="mt-3 text-sm text-primary">
              Válida hasta:{" "}
              {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "—"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
