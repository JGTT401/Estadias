import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("es", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ScanHistory() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("scans")
        .select(`
          id,
          created_at,
          user_id,
          scanned_user:profiles!user_id(email, visits)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!cancelled) {
        if (error) {
          console.error("Error cargando escaneos:", error);
        } else {
          setScans(data ?? []);
        }
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-500">Cargando historial...</p>
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-hidden">
      <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight mb-1">Historial de escaneos</h2>
      <p className="text-neutral-500 text-sm mb-4 sm:mb-6">Últimos escaneos realizados.</p>

      {scans.length === 0 ? (
        <p className="text-neutral-500 py-8 text-center">No hay escaneos registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-600">
                <th className="py-3 px-2 font-medium">Fecha</th>
                <th className="py-3 px-2 font-medium">Usuario</th>
                <th className="py-3 px-2 font-medium">Visitas</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((s) => {
                const profile = Array.isArray(s.scanned_user) ? s.scanned_user[0] : s.scanned_user;
                const email = profile?.email ?? "—";
                const visits = profile?.visits ?? "—";
                return (
                  <tr key={s.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-2 text-neutral-800">{formatDate(s.created_at)}</td>
                    <td className="py-3 px-2 text-neutral-800">{email}</td>
                    <td className="py-3 px-2 text-neutral-600">{visits}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
