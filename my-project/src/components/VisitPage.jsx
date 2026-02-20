import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthProvider";

export default function VisitPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [visitPoint, setVisitPoint] = useState(null);
  const [status, setStatus] = useState("Cargando...");
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data } = await supabase
          .from("visit_points")
          .select("*")
          .eq("id", id)
          .single();

        if (!data) {
          if (mounted) setStatus("Punto no encontrado");
          return;
        }
        if (mounted) setVisitPoint(data);

        const insertPayload = {
          visit_point_id: id,
          visitor_id: user?.id ?? null,
          visitor_email: user?.email ?? null,
        };

        const { data: visitData, error: visitErr } = await supabase
          .from("visits")
          .insert([insertPayload])
          .select()
          .single();

        if (visitErr) {
          console.error("Error registrando visita:", visitErr);
          if (mounted) setStatus("Error registrando visita");
        } else {
          if (mounted) setStatus("Visita registrada");
        }

        if (data.reward_text) {
          if (data.reward_quantity === 0) setCanClaim(true);
          else if (data.reward_quantity > 0) setCanClaim(true);
        }
      } catch (err) {
        console.error("VisitPage load error:", err);
        if (mounted) setStatus("Error cargando punto");
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id, user]);

  async function claimReward() {
    try {
      const userId = user?.id ?? null;
      const { data, error } = await supabase.rpc("claim_reward_atomic", {
        p_visit_point_id: id,
        p_user_id: userId,
      });
      if (error) throw error;
      const result = data?.[0];
      if (result?.success) {
        setStatus(
          "Recompensa reclamada: " +
            (result.reward_code || visitPoint.reward_text),
        );
        setCanClaim(false);
      } else {
        setStatus(result?.message || "No se pudo reclamar");
      }
    } catch (err) {
      console.error("claimReward error:", err);
      alert("Error al reclamar: " + (err.message || JSON.stringify(err)));
    }
  }

  if (!visitPoint)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-white rounded shadow">{status}</div>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-2">{visitPoint.title}</h2>
        <p className="text-gray-600 mb-4">{visitPoint.description}</p>
        <p className="text-sm text-gray-500 mb-4">{status}</p>
        {visitPoint.reward_text && (
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded">
              <strong className="block">{visitPoint.reward_text}</strong>
              <span className="text-sm text-gray-500">
                Código: {visitPoint.reward_code || "—"}
              </span>
            </div>
            {canClaim ? (
              <button
                onClick={claimReward}
                className="px-4 py-2 bg-primary text-white rounded"
              >
                Reclamar recompensa
              </button>
            ) : (
              <div className="text-sm text-gray-500">
                No disponible para reclamar
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
