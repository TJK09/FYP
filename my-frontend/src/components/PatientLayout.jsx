import { Outlet } from "react-router-dom";
import Patient from "./Navbar"

export default function PatientLayout() {
  return (
    <>
      <Patient/>
      <Outlet />
    </>
  );
}
