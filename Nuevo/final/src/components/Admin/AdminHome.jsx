import React from "react";

export default function AdminHome({ profile }) {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Bienvenido, Admin</h2>
      <p className="text-gray-600 mb-4">
        Panel de control rápido y estadísticas.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Usuarios totales</div>
          <div className="text-2xl font-semibold">—</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Escaneos hoy</div>
          <div className="text-2xl font-semibold">—</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Promociones activas</div>
          <div className="text-2xl font-semibold">—</div>
        </div>
      </div>
    </div>
  );
}
