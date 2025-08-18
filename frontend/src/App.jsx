import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Admin Pages
import AdminLayout from "./layouts/AdminLayout";
import DoctorManagement from "./pages/Admin/DoctorManagement";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminSlots from "./pages/Admin/AdminSlots";
import AdminAppointments from "./pages/Admin/AdminAppointments";
import AdminPatients from "./pages/Admin/AdminPatients";
import AdminProfile from "./pages/Admin/AdminProfile";
import Reports from "./pages/Admin/Reports";

// Patient Pages & Layout
import PatientLayout from "./layouts/PatientLayout";
import PatientDashboard from "./pages/Patient/PatientDashboard";
import BookAppointment from "./pages/Patient/BookAppointment";
import PatientAppointments from "./pages/Patient/PatientAppointments";
import PatientProfile from "./pages/Patient/PatientProfile";
import PatientContact from "./pages/Patient/PatientContact";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes wrapped in Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="doctors" element={<DoctorManagement />} />
          <Route path="doctor-slots" element={<AdminSlots />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Patient Routes wrapped in Layout */}
        <Route path="/patient" element={<PatientLayout />}>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="book" element={<BookAppointment />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="contact" element={<PatientContact />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
