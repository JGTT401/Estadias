// src/components/User/MyQR.jsx
import React from "react";
import QRCode from "react-qr-code";

export default function MyQR({ profile }) {
  if (!profile) return null;

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold mb-2">Mi QR</h3>
      <div className="inline-block p-4 bg-white rounded shadow">
        <QRCode value={profile.qr_code} size={200} />
      </div>
      <div className="mt-2 text-sm">
        Visitas: <b>{profile.visits}</b>
      </div>
    </div>
  );
}
