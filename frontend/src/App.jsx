import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorManagement from "./pages/Admin/DoctorManagement";
import MyAppointments from "./pages/MyAppointments";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminSlots from "./pages/Admin/AdminSlots";
import AdminAppointments from "./pages/Admin/AdminAppointments";
import PatientDashboard from "./pages/Patient/PatientDashboard";
import BookAppointment from "./pages/Patient/BookAppointment";
import PatientAppointments from "./pages/Patient/PatientAppointments";
import PatientProfile from "./pages/Patient/PatientProfile";
import PatientContact from "./pages/Patient/PatientContact";
import AdminPatients from "./pages/Admin/AdminPatients";

function App() {
  return (
    <Router>
      {/* ToastContainer for React-Toastify */}
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/doctors" element={<DoctorManagement />} />
        <Route path="/appointments/my" element={<MyAppointments />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/doctor-slots" element={<AdminSlots />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/book" element={<BookAppointment />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/contact" element={<PatientContact />} />
        <Route path="/admin/patients" element={<AdminPatients />} />
      </Routes>
    </Router>
  );
}

export default App;
