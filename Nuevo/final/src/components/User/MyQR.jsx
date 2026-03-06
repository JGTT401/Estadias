// src/components/User/MyQR.jsx
import React from "react";
import QRCode from "react-qr-code";

export default function MyQR({ profile }) {
  if (!profile) return null;

  return (
    <div className="flex flex-col items-center w-full max-w-full overflow-hidden px-0 sm:px-2">
      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1">Mi código QR</h3>
      <p className="text-neutral-500 text-sm mb-4 sm:mb-6">Muéstralo para registrar visitas.</p>
      <div className="inline-block p-4 sm:p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm max-w-[min(100%,260px)]">
        <QRCode value={profile.qr_code} size={200} />
      </div>
      <div className="mt-4 px-4 py-2.5 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-700 text-sm font-medium text-center">
        Visitas acumuladas: <span className="text-neutral-900">{profile.visits ?? 0}</span>
      </div>
    </div>
  );
}
