import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function PromotionsList({ userId }) {
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    if (!userId) {
      queueMicrotask(() => setPromos([]));
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: ups } = await supabase
        .from("user_promotions")
        .select("promotion_id")
        .eq("user_id", userId);
      if (cancelled) return;
      const awardedIds = (ups ?? []).map((u) => u.promotion_id);
      if (awardedIds.length === 0) {
        setPromos([]);
        return;
      }
      const { data } = await supabase
        .from("promotions")
        .select("*")
        .in("id", awardedIds);
      if (!cancelled) setPromos(data ?? []);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-1">Promociones ganadas</h3>
      <p className="text-neutral-500 text-sm mb-4">Tus promociones por visitas acumuladas.</p>
      {promos.length === 0 ? (
        <p className="text-neutral-500 py-8 text-center">Aún no tienes promociones. Sigue acumulando visitas.</p>
      ) : (
        <ul className="space-y-3">
          {promos.map((p) => (
            <li key={p.id} className="card-neutral p-4 bg-neutral-50 border-neutral-200">
              <p className="font-medium text-neutral-900">{p.title}</p>
              <p className="text-sm text-neutral-600 mt-0.5">{p.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
