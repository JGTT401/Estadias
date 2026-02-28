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
        (result) => {
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
    if (!adminId) {
      alert("Error de sesión: no se pudo identificar al administrador.");
      return;
    }
    const qrCode = String(text ?? "").trim();
    if (!qrCode) return alert("El código QR no contiene datos válidos.");

    const { data: user, error } = await supabase
      .from("profiles")
      .select("id, visits")
      .eq("qr_code", qrCode)
      .maybeSingle();

    if (error) {
      console.error("Error al buscar usuario por QR:", error);
      return alert("Error al buscar usuario. Revisa la consola y las políticas RLS en Supabase.");
    }
    if (!user) return alert("Usuario no encontrado");

    const newVisits = (user.visits ?? 0) + 1;

    const { error: scanError } = await supabase
      .from("scans")
      .insert({ admin_id: adminId, user_id: user.id });
    if (scanError) {
      console.error("Error al registrar escaneo:", scanError);
      return alert(
        "Error al registrar escaneo. Revisa las políticas RLS en la tabla 'scans'. " +
          scanError.message,
      );
    }

    // Las visitas se incrementan automáticamente por un trigger en la BD al insertar en scans

    // Asignar promociones que el usuario recién alcanza
    const { data: activePromos } = await supabase
      .from("promotions")
      .select("id, min_visits, title")
      .eq("active", true)
      .lte("min_visits", newVisits);

    if (activePromos?.length > 0) {
      const { data: existing } = await supabase
        .from("user_promotions")
        .select("promotion_id")
        .eq("user_id", user.id);
      const alreadyAwarded = new Set((existing ?? []).map((r) => r.promotion_id));
      const toAward = activePromos.filter((p) => !alreadyAwarded.has(p.id));

      if (toAward.length > 0) {
        const now = new Date().toISOString();
        await supabase.from("user_promotions").insert(
          toAward.map((p) => ({
            user_id: user.id,
            promotion_id: p.id,
            awarded_at: now,
          }))
        );
        const names = toAward.map((p) => p.title).join(", ");
        alert(`Visita registrada. ¡Ganaste: ${names}!`);
        return;
      }
    }
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
