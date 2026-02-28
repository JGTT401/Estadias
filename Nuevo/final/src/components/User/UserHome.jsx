import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function UserHome({ profile }) {
  const [promoCount, setPromoCount] = useState(null);
  const [visits, setVisits] = useState(null);

  useEffect(() => {
    if (!profile?.id) {
      queueMicrotask(() => {
        setPromoCount(null);
        setVisits(null);
      });
      return;
    }
    let cancelled = false;
    (async () => {
      const [promoRes, profileRes] = await Promise.all([
        supabase
          .from("user_promotions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", profile.id),
        supabase
          .from("profiles")
          .select("visits")
          .eq("id", profile.id)
          .single(),
      ]);
      if (cancelled) return;
      setPromoCount(promoRes.count ?? 0);
      if (!profileRes.error) setVisits(profileRes.data?.visits ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Bienvenido</h2>
      <p className="text-gray-600 mb-4">Aquí puedes ver tu resumen rápido.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Visitas acumuladas</div>
          <div className="text-2xl font-semibold">
            {visits ?? profile?.visits ?? 0}
          </div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Promociones ganadas</div>
          <div className="text-2xl font-semibold">
            {promoCount !== null ? promoCount : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
