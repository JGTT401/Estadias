import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import QRCode from "react-qr-code";

export default function QRGenerator() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function load() {
      const s = await supabase.auth.getSession();
      const userId = s.data.session.user.id;
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(p);
    }
    load();
  }, []);

  if (!profile) return <div>Cargando QR...</div>;

  return (
    <div>
      <h3 className="text-xl mb-4">Tu QR único</h3>
      <div className="p-6 bg-white rounded inline-block">
        <QRCode value={profile.qr_uuid} size={220} />
        <p className="mt-2 text-sm text-gray-600">
          Muestra este QR al admin para registrar tu visita.
        </p>
      </div>
    </div>
  );
}
