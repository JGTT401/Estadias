import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import MessagesUser from "./MessagesUser";
import PromotionsUser from "./PromotionsUser";
import QRGenerator from "./QRGenerator";

export default function UserHome() {
  return (
    <div className="p-8">
      <h2 className="text-2xl mb-4">User Dashboard</h2>
      <nav className="flex gap-4 mb-6">
        <Link to="messages" className="text-blue-600">
          Mensajes
        </Link>
        <Link to="promotions" className="text-blue-600">
          Promociones
        </Link>
        <Link to="qr" className="text-blue-600">
          Mi QR
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<div>Selecciona una opción</div>} />
        <Route path="messages" element={<MessagesUser />} />
        <Route path="promotions" element={<PromotionsUser />} />
        <Route path="qr" element={<QRGenerator />} />
      </Routes>
    </div>
  );
}
