import React from "react";
import { Navigate } from "react-router-dom";

const PatientProtectedRoute = ({ children }) => {
  const token =
    localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  const role =
    (localStorage.getItem("role") || sessionStorage.getItem("role") || "").toLowerCase();

  if (!token || role !== "patient") {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default PatientProtectedRoute;
