import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import MessagesAdmin from "./MessagesAdmin";
import PromotionsAdmin from "./PromotionsAdmin";
import QRScanner from "./QRScanner";

export default function AdminHome() {
  return (
    <div className="p-8">
      <h2 className="text-2xl mb-4">Admin Dashboard</h2>
      <nav className="flex gap-4 mb-6">
        <Link to="messages" className="text-blue-600">
          Mensajes
        </Link>
        <Link to="promotions" className="text-blue-600">
          Promociones
        </Link>
        <Link to="scan" className="text-blue-600">
          Escanear QR
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<div>Selecciona una opción</div>} />
        <Route path="messages" element={<MessagesAdmin />} />
        <Route path="promotions" element={<PromotionsAdmin />} />
        <Route path="scan" element={<QRScanner />} />
      </Routes>
    </div>
  );
}
