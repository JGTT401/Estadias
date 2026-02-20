import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthProvider";

export default function PromotionsList() {
  const { user, loading: authLoading } = useAuth();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setPromos([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const { data: promotions, error: pErr } = await supabase
          .from("promotions")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (pErr) throw pErr;

        const { data: claims, error: cErr } = await supabase
          .from("reward_claims")
          .select("promotion_id, user_id")
          .eq("user_id", user.id);

        if (cErr) throw cErr;

        const claimedPromotionIds = new Set(
          (claims || []).map((c) => c.promotion_id),
        );
        const unlocked = (promotions || []).filter((p) =>
          claimedPromotionIds.has(p.id),
        );

        if (mounted) setPromos(unlocked);
      } catch (err) {
        console.error("Error cargando promociones:", err);
        if (mounted) setPromos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [user, authLoading]);

  if (authLoading || loading)
    return <div className="p-6">Cargando promociones...</div>;
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
