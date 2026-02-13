import React from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner() {
  const navigate = useNavigate();
  const refId = "reader";

  React.useEffect(() => {
    const html5QrCode = new Html5Qrcode(refId);
    const config = { fps: 10, qrbox: 250 };

    html5QrCode
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          try {
            const payload = JSON.parse(decodedText);
            if (payload.visit_point_id) {
              navigate(`/visit/${payload.visit_point_id}`);
              html5QrCode.stop().catch(() => {});
            }
          } catch (err) {
            console.error("QR no válido", err);
          }
        },
        (errorMessage) => {},
      )
      .catch((err) => console.error("No se pudo iniciar cámara", err));

    return () => {
      html5QrCode.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-3">Escanear QR</h3>
        <div id={refId} style={{ width: "100%" }} />
      </div>
    </div>
  );
}
