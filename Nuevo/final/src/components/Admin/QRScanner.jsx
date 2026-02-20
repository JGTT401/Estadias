import React, { useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { supabase } from "../../services/supabaseClient";

export default function QRScanner({ adminId }) {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  async function startScan() {
    try {
      codeReaderRef.current = new BrowserMultiFormatReader();
      await codeReaderRef.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, err) => {
          if (result) {
            handleResult(result.getText());
            codeReaderRef.current.reset();
          }
        },
      );
    } catch (err) {
      console.error(err);
      alert("Error al iniciar la cámara");
    }
  }

  async function handleResult(text) {
    const { data: user, error } = await supabase
      .from("profiles")
      .select("id, visits")
      .eq("qr_code", text)
      .single();
    if (error || !user) return alert("Usuario no encontrado");
    await supabase
      .from("scans")
      .insert({ admin_id: adminId, user_id: user.id });
    await supabase
      .from("profiles")
      .update({ visits: user.visits + 1 })
      .eq("id", user.id);
    alert("Visita registrada");
  }

  function stopScan() {
    codeReaderRef.current?.reset();
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Escanear QR</h3>
      <video ref={videoRef} className="w-full h-64 bg-black mb-2" />
      <div className="flex gap-2">
        <button
          className="bg-indigo-600 text-white px-3 py-1 rounded"
          onClick={startScan}
        >
          Iniciar
        </button>
        <button
          className="bg-gray-400 text-white px-3 py-1 rounded"
          onClick={stopScan}
        >
          Detener
        </button>
      </div>
    </div>
  );
}
