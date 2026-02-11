// src/components/QRGenerator.jsx
import React from "react";
import { QRCodeCanvas } from "qrcode.react"; // <- export nombrado

export default function QRGenerator({ promotion }) {
  const payload = JSON.stringify({ code: promotion.code, id: promotion.id });
  return (
    <div>
      <h4>{promotion.title}</h4>
      <QRCodeCanvas value={payload} size={160} />
      <p>{promotion.description}</p>
    </div>
  );
}
