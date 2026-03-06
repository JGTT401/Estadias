// src/components/Shared/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? "bg-neutral-800 text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
  }`;

function Navbar({ items = [] }) {
  return (
    <nav className="bg-white border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="text-lg font-semibold text-neutral-900 tracking-tight">MiApp</span>
            <div className="flex items-center gap-1">
              {items.map((i) => (
                <NavLink key={i.to} to={i.to} className={linkClass}>
                  {i.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
