// src/components/Admin/AdminDashboard.jsx
import React from "react";
import { useAuth } from "../../AuthContext";

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {user && <p>Welcome, {user.email}!</p>}
    </div>
  );
}

export default AdminDashboard;
