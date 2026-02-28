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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Bienvenido, Admin</h2>
      <p className="text-gray-600 mb-4">
        Panel de control rápido y estadísticas.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Usuarios totales</div>
          <div className="text-2xl font-semibold">
            {stats.users !== null ? stats.users : "—"}
          </div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Escaneos hoy</div>
          <div className="text-2xl font-semibold">
            {stats.scansToday !== null ? stats.scansToday : "—"}
          </div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Promociones activas</div>
          <div className="text-2xl font-semibold">
            {stats.promotionsActive !== null ? stats.promotionsActive : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
