import DoctorNavbar from "./DoctorNavbar";
import { Outlet } from "react-router-dom";

export default function DoctorLayout() {
  return (
    <>
      <DoctorNavbar />
      <Outlet />
    </>
  );
}
