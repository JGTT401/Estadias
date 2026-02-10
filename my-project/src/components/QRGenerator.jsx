import React from "react";
import QRCode from "qrcode.react";

export default function QRGenerator({ promotion }) {
  // promotion.code o promotion.url
  const payload = JSON.stringify({ code: promotion.code, id: promotion.id });

  return (
    <div>
      <h3>{promotion.title}</h3>
      <QRCode value={payload} size={256} />
      <p>{promotion.description}</p>
    </div>
  );
}
