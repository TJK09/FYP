import React from "react";
import { Navigate } from "react-router-dom";

const DoctorProtectedRoute = ({ children }) => {
  const token =
    localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  const role =
    (localStorage.getItem("role") || sessionStorage.getItem("role") || "").toLowerCase();

  if (!token || role !== "doctor") {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default DoctorProtectedRoute;
