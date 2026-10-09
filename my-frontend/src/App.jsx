import React from "react";
import { Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from "./components/footer"

// Public Pages
import Home from './pages/Home';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import EmailVerificationStatus from './pages/EmailVerificationStatus';
import VerifyEmailToken from './pages/VerifyEmailToken';
import AboutUs from './pages/About';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Patient Pages
import PatientDashboard from './pages/patient/PatientdashBoard';
import AppointmentBooking from './pages/patient/AppointmentBooking';
import CallAtHomeService from './pages/patient/CallAtHomeService';
import LabTestBooking from './pages/patient/LabTestBooking';
import LabReports from './pages/patient/LabReports';
import MedicalRecords from './pages/patient/MedicalRecords';
import ProgressReports from './pages/patient/ProgressReports';
import DepressionAnalysis from './pages/patient/DepressionAnalysis';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctordashBoard';
import DoctorAdd from './pages/doctor/DoctorAddRecord';
import DoctorLabTestBooking from './pages/doctor/DoctorLabTests';
import DoctorPrescription from './pages/doctor/DoctorPrescription';
import MedicalRecord from './pages/doctor/DoctorMedicalRecords';

// Admin Pages
import AdminDashboard from './pages/admin/AdmindashBoard';
import AdminManagement from './pages/admin/AdminManagement';

// Protected Routes
import DoctorProtectedRoute from './components/DoctorProtectedRoute';
import PatientProtectedRoute from './components/PatientProtectedRoute';
import PatientLayout from "./components/PatientLayout";
import DoctorLayout from "./components/DoctorLayout";

const App = () => {
  return (
    <div>
      <Routes>


        {/* 🌐 PUBLIC ROUTES */}
      <Route element={<PatientLayout/>}>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/login" element={<Signin />} />
        <Route path="/emailverification" element={<EmailVerificationStatus />} />
        <Route path="/verify-email-token" element={<VerifyEmailToken />} />
        <Route path="/About-us" element={<AboutUs />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        
      
        {/* 👩‍⚕️ PATIENT PROTECTED ROUTES */}
    
        <Route
          path="/dashboard/patient"
          element={
            <PatientProtectedRoute>
              <PatientDashboard />
            </PatientProtectedRoute>
          }
        />
        <Route
          path="/appointment"
          element={
            <PatientProtectedRoute>
              <AppointmentBooking />
            </PatientProtectedRoute>
          }
        />
        <Route
          path="/call-at-home"
          element={
            <PatientProtectedRoute>
              <CallAtHomeService />
            </PatientProtectedRoute>
          }
        />
        <Route
          path="/lab-test"
          element={
            <PatientProtectedRoute>
              <LabTestBooking />
            </PatientProtectedRoute>
          }
        />
        <Route
          path="/lab-reports"
          element={
            <PatientProtectedRoute>
              <LabReports />
            </PatientProtectedRoute>
          }
        />
        <Route
          path="/medical-records"
          element={
            <PatientProtectedRoute>
              <MedicalRecords />
            </PatientProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <PatientProtectedRoute>
              <ProgressReports />
            </PatientProtectedRoute>
          }
        />
        <Route
          path="/Depression"
          element={
            <PatientProtectedRoute>
              <DepressionAnalysis />
            </PatientProtectedRoute>
          }
        />

      </Route>

        {/* 🧑‍⚕️ DOCTOR PROTECTED ROUTES */}
      <Route element={<DoctorLayout/>}>
        <Route
          path="/dashboard/doctor"
          element={
            <DoctorProtectedRoute>
              <DoctorDashboard />
            </DoctorProtectedRoute>
          }
        />
        <Route
          path="/doctor/add-record"
          element={
            <DoctorProtectedRoute>
              <DoctorAdd />
            </DoctorProtectedRoute>
          }
        />
        <Route
          path="/doctor/Records"
          element={
            <DoctorProtectedRoute>
              <MedicalRecord />
            </DoctorProtectedRoute>
          }
        />
        <Route
          path="/doctor/lab-tests"
          element={
            <DoctorProtectedRoute>
              <DoctorLabTestBooking />
            </DoctorProtectedRoute>
          }
        />
        <Route
          path="/doctor/prescriptions"
          element={
            <DoctorProtectedRoute>
              <DoctorPrescription />
            </DoctorProtectedRoute>
          }
        />
      </Route>

        {/* 🧑‍💼 ADMIN ROUTES */}
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminManagement />} />
      </Routes>
    <Footer style={{margin:0}}>
      </Footer> 
    </div>
    
  );
};

export default App;
