// src/components/Shared/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`;

function Navbar({ items = [] }) {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold">MiApp</div>
            <div className="flex items-center space-x-1">
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
