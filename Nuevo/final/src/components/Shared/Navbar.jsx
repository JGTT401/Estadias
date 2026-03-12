import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `block px-4 py-3 rounded-lg text-sm font-medium transition-colors md:py-2.5 md:px-4 ${
    isActive
      ? "bg-neutral-800 text-white"
      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
  }`;

function Navbar({ items = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 min-h-[3.5rem]">
          <span className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">
            MiApp
          </span>

          {/* enlaces inline desktop*/}
          <div className="hidden md:flex items-center gap-1">
            {items.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                className={linkClass}
                end={i.to.endsWith("/home")}
              >
                {i.label}
              </NavLink>
            ))}
          </div>

          {/* botón menú movil*/}
          <button
            type="button"
            className="md:hidden p-2 -mr-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-300 aria-expanded={open}"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            <span className="sr-only">
              {open ? "Cerrar menú" : "Abrir menú"}
            </span>
            {open ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* menú desplegable movil*/}
        {open && (
          <div className="md:hidden py-2 border-t border-neutral-100">
            <div className="flex flex-col gap-0.5">
              {items.map((i) => (
                <NavLink
                  key={i.to}
                  to={i.to}
                  className={linkClass}
                  end={i.to.endsWith("/home")}
                  onClick={() => setOpen(false)}
                >
                  {i.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
