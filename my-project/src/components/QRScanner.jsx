import React from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode"; // alternativa: react-qr-reader

export default function QRScanner() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false,
    );

    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(decodedText, decodedResult) {
      try {
        const payload = JSON.parse(decodedText);
        // Redirigir a la página de promoción con query params
        navigate(
          `/promotion/${payload.id}?code=${encodeURIComponent(payload.code)}`,
        );
        scanner.clear();
      } catch (err) {
        console.error("QR no válido", err);
      }
    }

    function onScanError(err) {
      // console.log(err);
    }

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return <div id="reader" style={{ width: "100%" }} />;
}
