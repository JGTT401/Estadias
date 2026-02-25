import React from "react";
import { Link } from "react-router-dom";

export default function Home({ profile }) {
  // Simple summary dashboard
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold">Bienvenido</h1>
        <p className="mt-2">Resumen general</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded">
            <h3 className="font-semibold">Tu rol</h3>
            <p className="mt-2">{profile?.role}</p>
          </div>
          <div className="p-4 border rounded">
            <h3 className="font-semibold">Mensajes</h3>
            <p className="mt-2">Revisa los mensajes enviados por admin</p>
          </div>
          <div className="p-4 border rounded">
            <h3 className="font-semibold">Promociones</h3>
            <p className="mt-2">Verifica promociones disponibles</p>
          </div>
        </div>

        <div className="mt-6">
          {profile?.role === "admin" ? (
            <Link to="/admin" className="text-blue-600">
              Ir al panel de Admin
            </Link>
          ) : (
            <Link to="/user" className="text-blue-600">
              Ir a tu panel
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
