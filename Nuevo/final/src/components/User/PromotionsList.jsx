import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function PromotionsList({ userId }) {
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    fetch();
  }, []);

  async function fetch() {
    const { data: ups } = await supabase
      .from("user_promotions")
      .select("promotion_id")
      .eq("user_id", userId);
    const awardedIds = (ups || []).map((u) => u.promotion_id);
    if (awardedIds.length === 0) {
      setPromos([]);
      return;
    }
    const { data } = await supabase
      .from("promotions")
      .select("*")
      .in("id", awardedIds);
    setPromos(data || []);
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Promociones ganadas</h3>
      {promos.length === 0 ? (
        <div>No tienes promociones aún</div>
      ) : (
        promos.map((p) => (
          <div key={p.id} className="mb-2 p-2 border rounded">
            <div className="font-semibold">{p.title}</div>
            <div className="text-sm">{p.description}</div>
          </div>
        ))
      )}
    </div>
  );
}
