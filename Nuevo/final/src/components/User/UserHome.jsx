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
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">Bienvenido</h2>
      <p className="text-neutral-500 text-sm mt-1 mb-6">Tu resumen rápido.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-neutral p-5">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Visitas acumuladas</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 tabular-nums">{visits ?? profile?.visits ?? 0}</p>
        </div>
        <div className="card-neutral p-5 bg-neutral-50 border-neutral-200">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Promociones ganadas</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 tabular-nums">{promoCount !== null ? promoCount : "—"}</p>
        </div>
      </div>
    </div>
  );
}
