import React, { useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { supabase } from "../../services/supabaseClient";
import { useToast } from "../../context/ToastContext";

export default function QRScanner({ adminId }) {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const scanSessionIdRef = useRef(0);
  const stopRequestedRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const toast = useToast();

  function cleanupCamera() {
    const video = videoRef.current;
    const stream = video?.srcObject;
    if (stream && typeof stream.getTracks === "function") {
      stream.getTracks().forEach((t) => t.stop());
    }
    if (video) video.srcObject = null;
  }

  async function startScan() {
    setCameraError("");
    if (!videoRef.current) return;

    // Invalidate any previous decode callbacks.
    scanSessionIdRef.current += 1;
    const sessionId = scanSessionIdRef.current;
    stopRequestedRef.current = false;

    try {
      setScanning(true);
      codeReaderRef.current = new BrowserMultiFormatReader();

      // Make sure previous camera usage is fully released.
      cleanupCamera();

      await codeReaderRef.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result) => {
          if (stopRequestedRef.current) return;
          if (sessionId !== scanSessionIdRef.current) return;
          if (result) {
            // We are intentionally stopping after a successful read.
            stopRequestedRef.current = true;
            void handleResult(result.getText());
            // One-shot scanning: stop immediately after a successful read.
            try {
              codeReaderRef.current?.reset?.();
            } catch {
              // ignore
            }
            setScanning(false);
            cleanupCamera();
          }
        },
      );
    } catch (err) {
      // If the user pressed "Detener", don't show an error toast.
      if (stopRequestedRef.current || sessionId !== scanSessionIdRef.current) return;

      console.error(err);
      const msg = err?.message ?? String(err);
      if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("not allowed")) {
        setCameraError("Permiso de cámara denegado. Activa el acceso en la configuración del navegador.");
      } else if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("no camera")) {
        setCameraError("No se encontró ninguna cámara disponible.");
      } else {
        setCameraError("Error al iniciar la cámara. Comprueba los permisos o usa otro dispositivo.");
      }
      toast.error("No se pudo iniciar la cámara");
    } finally {
      if (sessionId === scanSessionIdRef.current) {
        setScanning(false);
      }
    }
  }

  async function handleResult(text) {
    if (!adminId) {
      toast.error("Error de sesión: no se pudo identificar al administrador.");
      return;
    }
    const qrCode = String(text ?? "").trim();
    if (!qrCode) {
      toast.error("El código QR no contiene datos válidos.");
      return;
    }

    const { data: user, error } = await supabase
      .from("profiles")
      .select("id, visits")
      .eq("qr_code", qrCode)
      .maybeSingle();

    if (error) {
      console.error("Error al buscar usuario por QR:", error);
      toast.error("Error al buscar usuario. Intenta de nuevo.");
      return;
    }
    if (!user) {
      toast.error("Usuario no encontrado");
      return;
    }

    const newVisits = (user.visits ?? 0) + 1;

    const { error: scanError } = await supabase
      .from("scans")
      .insert({ admin_id: adminId, user_id: user.id });

    if (scanError) {
      console.error("Error al registrar escaneo:", scanError);
      toast.error("Error al registrar escaneo. " + scanError.message);
      return;
    }

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
        toast.success(`Visita registrada. ¡Ganaste: ${names}!`);
        return;
      }
    }
    toast.success("Visita registrada");
  }

  function stopScan() {
    stopRequestedRef.current = true;
    setScanning(false);
    setCameraError("");
    try {
      codeReaderRef.current?.reset?.();
    } catch {
      // ignore
    }
    cleanupCamera();
  }

  return (
    <div className="max-w-full overflow-hidden">
      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1">Escanear código QR</h3>
      <p className="text-neutral-500 text-sm mb-3 sm:mb-4">
        Pulsa "Iniciar cámara" para solicitar permisos y escanear el código QR del usuario.
      </p>

      {cameraError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700" role="alert">
          {cameraError}
        </div>
      )}

      <div className="rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 aspect-video max-h-56 sm:max-h-72 lg:max-h-80 mb-4">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
        <button
          type="button"
          className="btn-neutral w-full sm:w-auto min-h-[2.75rem]"
          onClick={startScan}
          disabled={scanning}
        >
          {scanning ? "Escaneando..." : "Iniciar cámara"}
        </button>
        <button type="button" className="btn-neutral-outline w-full sm:w-auto min-h-[2.75rem]" onClick={stopScan}>
          Detener
        </button>
      </div>
    </div>
  );
}
