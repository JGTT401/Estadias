// src/components/User/MyQR.jsx
import React from "react";
import QRCode from "react-qr-code";

export default function MyQR({ profile }) {
  if (!profile) return null;

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold text-neutral-900 mb-1">Mi código QR</h3>
      <p className="text-neutral-500 text-sm mb-6">Muéstralo para registrar visitas.</p>
      <div className="inline-block p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
        <QRCode value={profile.qr_code} size={220} />
      </div>
      <div className="mt-4 px-4 py-2 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-700 text-sm font-medium">
        Visitas acumuladas: <span className="text-neutral-900">{profile.visits ?? 0}</span>
      </div>
    </div>
  );
}
