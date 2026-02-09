import "./App.css";

// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import UserDashboard from "./components/User/UserDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Layout/Navbar";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={<ProtectedRoute component={UserDashboard} />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute component={AdminDashboard} isAdmin={true} />
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
