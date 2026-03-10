import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl sm:text-8xl font-bold text-neutral-300">404</h1>
      <p className="text-neutral-600 mt-4 text-center">Página no encontrada</p>
      <Link
        to="/"
        className="mt-6 btn-neutral"
      >
        Ir al inicio
      </Link>
    </div>
  );
}
