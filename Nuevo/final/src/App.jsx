// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import AdminLayout from "./components/Admin/AdminLayout";
import MessagesPanel from "./components/Admin/MessagesPanel";
import PromotionsPanel from "./components/Admin/PromotionsPanel";
import QRScanner from "./components/Admin/QRScanner";
import UserLayout from "./components/User/UserLayout";
import MyQR from "./components/User/MyQR";
import MessagesList from "./components/User/MessagesList";
import PromotionsList from "./components/User/PromotionsList";
import AdminHome from "./components/Admin/AdminHome";
import UserHome from "./components/User/UserHome";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <Routes>
      {" "}
      <Route
        path="/"
        element={
          user ? (
            profile?.role === "admin" ? (
              <Navigate to="/admin/home" />
            ) : (
              <Navigate to="/user/home" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />{" "}
      <Route path="/login" element={<Login />} />{" "}
      <Route path="/signup" element={<Signup />} />{" "}
      <Route
        path="/admin"
        element={
          user && profile?.role === "admin" ? (
            <AdminLayout profile={profile} />
          ) : (
            <Navigate to="/login" />
          )
        }
      >
        {" "}
        <Route index element={<Navigate to="home" replace />} />{" "}
        <Route path="home" element={<AdminHome profile={profile} />} />{" "}
        <Route
          path="messages"
          element={<MessagesPanel adminId={profile?.id} />}
        />{" "}
        <Route path="promotions" element={<PromotionsPanel />} />{" "}
        <Route path="scan" element={<QRScanner adminId={profile?.id} />} />{" "}
      </Route>{" "}
      <Route
        path="/user"
        element={
          user && profile?.role === "user" ? (
            <UserLayout profile={profile} />
          ) : (
            <Navigate to="/login" />
          )
        }
      >
        {" "}
        <Route index element={<Navigate to="home" replace />} />{" "}
        <Route path="home" element={<UserHome profile={profile} />} />{" "}
        <Route path="myqr" element={<MyQR profile={profile} />} />{" "}
        <Route path="messages" element={<MessagesList />} />{" "}
        <Route
          path="promotions"
          element={<PromotionsList userId={profile?.id} />}
        />{" "}
      </Route>{" "}
    </Routes>
  );
}
