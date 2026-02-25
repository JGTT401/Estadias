import React, { useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { supabase } from "../../supabaseClient";

export default function QRScanner() {
  const scannerRef = useRef(null);

  useEffect(() => {
    const qrRegionId = "qr-reader";
    const html5QrCode = new Html5Qrcode(qrRegionId);
    scannerRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          // decodedText expected to be the user's qr_uuid
          try {
            // find profile by qr_uuid
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("qr_uuid", decodedText)
              .single();
            if (!profile) {
              alert("QR no reconocido");
              return;
            }
            const user = await supabase.auth.getUser();
            const { error } = await supabase.from("visits").insert([
              {
                user_id: profile.id,
                scanned_by: user.data.user.id,
              },
            ]);
            if (error) {
              alert("Error registrando visita: " + error.message);
            } else {
              alert(
                `Visita registrada para ${profile.email || profile.full_name || profile.id}`,
              );
            }
          } catch (err) {
            console.error(err);
          }
        },
        (errorMessage) => {
          // ignore scan errors
        },
      )
      .catch((err) => console.error("start failed", err));

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch(() => {});
      }
    };
  }, []);

  return (
    <div>
      <h3 className="text-xl mb-4">Escanear QR de usuario</h3>
      <div id="qr-reader" style={{ width: "100%", maxWidth: 500 }} />
    </div>
  );
}
