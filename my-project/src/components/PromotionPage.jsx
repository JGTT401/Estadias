import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../lib/supabaseClient";
import { AuthContext } from "./AuthProvider";
import { useParams, useSearchParams } from "react-router-dom";

export default function PromotionPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const [promotion, setPromotion] = useState(null);
  const { user, profile } = useContext(AuthContext);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("promotions")
        .select("*")
        .eq("id", id)
        .single();
      setPromotion(data);

      // Registrar visita
      await supabase.from("visits").insert([
        {
          promotion_id: id,
          visitor_email: user?.email ?? null,
          ip: null,
        },
      ]);
    }
    load();
  }, [id]);

  if (!promotion) return <div>Cargando promoción...</div>;

  // Validar código simple
  if (promotion.code !== code) {
    return <div>Código de promoción inválido.</div>;
  }

  return (
    <div>
      <h2>{promotion.title}</h2>
      <p>{promotion.description}</p>
      {promotion.url && <a href={promotion.url}>Ir a la promoción</a>}
    </div>
  );
}
