import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function UserHome({ profile }) {
  const [promoCount, setPromoCount] = useState(null);
  const [visits, setVisits] = useState(null);
  const [homeImages, setHomeImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingImages(true);
      const { data, error } = await supabase
        .from("home_images")
        .select("id, image_data")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (error) {
        console.error("Error cargando imágenes del home:", error);
        setHomeImages([]);
      } else {
        setHomeImages(data ?? []);
      }
      setLoadingImages(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-full overflow-hidden">
      <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight">Bienvenido</h2>
      <p className="text-neutral-500 text-sm mt-1 mb-4 sm:mb-6">Tu resumen rápido.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="card-neutral p-4 sm:p-5">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Visitas acumuladas</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 tabular-nums">{visits ?? profile?.visits ?? 0}</p>
        </div>
        <div className="card-neutral p-4 sm:p-5 bg-neutral-50 border-neutral-200">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Promociones ganadas</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 tabular-nums">{promoCount !== null ? promoCount : "—"}</p>
        </div>
      </div>

      <section className="mt-6 sm:mt-8">
        <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1">Novedades</h3>
        <p className="text-neutral-500 text-sm mb-3 sm:mb-4">Imágenes publicadas por el equipo.</p>
        {loadingImages ? (
          <p className="text-neutral-500 py-4">Cargando imágenes...</p>
        ) : homeImages.length === 0 ? (
          <p className="text-neutral-500 py-8 text-center">Aún no hay imágenes publicadas.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {homeImages.map((img) => (
              <li key={img.id} className="card-neutral p-2 sm:p-3">
                <div className="rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 aspect-video">
                  <img src={img.image_data} alt="Novedad publicada por el equipo" className="w-full h-full object-cover" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
