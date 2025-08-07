import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorManagement from "./pages/Admin/DoctorManagement";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import DoctorSlots from "./pages/Admin/DoctorSlots";

function App() {
  return (
    <Router>
      {/* ToastContainer for React-Toastify */}
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/doctors" element={<DoctorManagement />} />
        <Route path="/appointments/book" element={<BookAppointment />} />
        <Route path="/appointments/my" element={<MyAppointments />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/doctor-slots" element={<DoctorSlots />} />
      </Routes>
    </Router>
  );
}

export default App;
