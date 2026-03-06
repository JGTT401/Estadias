import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function AdminHome() {
  const [stats, setStats] = useState({
    users: null,
    scansToday: null,
    promotionsActive: null,
  });

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("scans")
        .select("id", { count: "exact", head: true })
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59.999`),
      supabase
        .from("promotions")
        .select("id", { count: "exact", head: true })
        .eq("active", true),
    ]).then(([usersRes, scansRes, promosRes]) => {
      setStats({
        users: usersRes.count ?? 0,
        scansToday: scansRes.count ?? 0,
        promotionsActive: promosRes.count ?? 0,
      });
    });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">Panel de control</h2>
      <p className="text-neutral-500 text-sm mt-1 mb-6">Resumen y estadísticas</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-neutral p-5">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Usuarios totales</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 tabular-nums">{stats.users !== null ? stats.users : "—"}</p>
        </div>
        <div className="card-neutral p-5 bg-neutral-50 border-neutral-200">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Escaneos hoy</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 tabular-nums">{stats.scansToday !== null ? stats.scansToday : "—"}</p>
        </div>
        <div className="card-neutral p-5">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Promociones activas</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 tabular-nums">{stats.promotionsActive !== null ? stats.promotionsActive : "—"}</p>
        </div>
      </div>
    </div>
  );
}
