import React from "react";

export default function UserHome({ profile }) {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Bienvenido</h2>
      <p className="text-gray-600 mb-4">Aquí puedes ver tu resumen rápido.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Visitas acumuladas</div>
          <div className="text-2xl font-semibold">{profile?.visits ?? 0}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Promociones ganadas</div>
          <div className="text-2xl font-semibold">—</div>
        </div>
      </div>
    </div>
  );
}
