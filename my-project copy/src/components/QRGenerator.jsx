// Antes (provoca error si no hay default export)
// import QRCode from 'qrcode.react';

// Ahora (export nombrado en v4+)
import { QRCodeCanvas } from "qrcode.react";

export default function QRGenerator({ visitPoint }) {
  const payload = JSON.stringify({ visit_point_id: visitPoint.id });
  return <QRCodeCanvas value={payload} size={120} />;
}
